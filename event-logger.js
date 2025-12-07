#!/usr/bin/env node

/**
 * Event Logger Service
 * 
 * Отдельный сервис для логирования событий актуаторов через WebSocket.
 * Подключается к демону через ws://localhost:3000 и логирует события в OpenSearch.
 * 
 * Использует те же функции из event-log.js для обеспечения идентичности формата.
 */

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const state = require('./src/controllers/state');
const {
  getDeviceTypeWithFallback,
  isActuatorDevice,
  getSiteName,
  getProjectName,
  getHumanName,
  getTriggerHuman,
  getTriggerDeviceId,
  roundToTenths,
  isNumericParam,
  NUMERIC_PARAMS
} = require('./src/logging/event-log');
const filters = require('./src/logging/filters');
const opensearch = require('./src/logging/opensearch');

// Конфигурация
const DAEMON_WS_URL = process.env.DAEMON_WS_URL || 'ws://localhost:3000';
const RECONNECT_DELAY = 5000; // 5 секунд
const MAX_RECONNECT_ATTEMPTS = 10;
const STATE_REQUEST_TIMEOUT = 30000; // 30 секунд
const BUFFER_MAX_SIZE = 100; // Максимальный размер буфера событий

// Константы для WebSocket сообщений (из src/init/constants.js и src/constants.js)
const { LIST, GET } = require('./src/init/constants');
const { ACTION_SET } = require('./src/constants');

// Состояние
let ws = null;
let deviceState = new Map(); // Хранение предыдущего состояния устройств
let reconnectAttempts = 0;
let isConnected = false;
let eventBuffer = []; // Буфер для событий при недоступности OpenSearch
let stateRequested = false;
let isInitialStateReceived = false;
let bufferFlushInterval = null; // Интервал для отправки событий из буфера

// 1. Кэш маппинга id -> name для обогащения событий на WebSocket
const deviceNameCache = new Map(); // id -> { name, human, timestamp }

// 2. Кэш состояния актуаторов (лампы, вентиляторы, кондеи, тёплые полы)
// Хранит время включения для вычисления длительности работы
const actuatorStateCache = new Map(); // id -> { onTimestamp, param, value }

// 3. Трассировка событий - генерация trace ID для цепочек связности
// Кэш trace_id по ID устройства/скрипта: id -> trace_id
const traceIdCache = new Map(); // id -> trace_id

// Логирование
const log = (message, ...args) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [event-logger] ${message}`, ...args);
};

const logError = (message, ...args) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [event-logger] ERROR: ${message}`, ...args);
};

// Обновление кэша имён устройств
const updateDeviceNameCache = (id, newState) => {
  if (!id || !newState || typeof newState !== 'object') return;
  
  const name = newState.name || null;
  const human = getHumanName(newState);
  
  // Обновляем кэш только если есть изменения
  const cached = deviceNameCache.get(id);
  if (!cached || cached.name !== name || cached.human !== human) {
    deviceNameCache.set(id, {
      name,
      human,
      timestamp: Date.now()
    });
  }
};

// Определение класса актуатора (лампа, вентилятор, кондей, тёплый пол)
const getActuatorClass = (id, newState) => {
  if (!newState || typeof newState !== 'object') return null;
  
  // Лампа: есть value или brightness
  if ('value' in newState || 'brightness' in newState || 'r' in newState || 'g' in newState || 'b' in newState) {
    return 'light';
  }
  
  // Вентилятор: есть fan_speed
  if ('fan_speed' in newState) {
    return 'fan';
  }
  
  // Кондей: есть mode (heat, cool, stop, dry, wet, ventilation)
  if ('mode' in newState) {
    return 'ac';
  }
  
  // Тёплый пол: есть setpoint или type === 'warm_floor'
  if ('setpoint' in newState || newState.type === 'warm_floor') {
    return 'warm_floor';
  }
  
  return null;
};

// Проверка, включён ли актуатор
const isActuatorOn = (actuatorClass, deviceState) => {
  if (!actuatorClass || !deviceState) return false;
  
  switch (actuatorClass) {
    case 'light':
      // Лампа включена, если value > 0 или brightness > 0 или есть цвет
      return (deviceState.value > 0) || 
             (deviceState.brightness > 0) || 
             (deviceState.r > 0 || deviceState.g > 0 || deviceState.b > 0);
    case 'fan':
      // Вентилятор включен, если fan_speed > 0
      return (deviceState.fan_speed > 0);
    case 'ac':
      // Кондей включен, если mode !== 'stop' и mode !== null
      return (deviceState.mode && deviceState.mode !== 'stop' && deviceState.mode !== null);
    case 'warm_floor':
      // Тёплый пол включен, если setpoint > 0 или value > 0
      return (deviceState.setpoint > 0) || (deviceState.value > 0);
    default:
      return false;
  }
};

// Обновление кэша состояния актуаторов
const updateActuatorStateCache = (id, oldState, newState) => {
  const actuatorClass = getActuatorClass(id, newState);
  if (!actuatorClass) return;
  
  const wasOn = isActuatorOn(actuatorClass, oldState);
  const isOn = isActuatorOn(actuatorClass, newState);
  
  const cached = actuatorStateCache.get(id);
  const now = Date.now();
  
  if (!wasOn && isOn) {
    // Включение: сохраняем время включения
    actuatorStateCache.set(id, {
      onTimestamp: now,
      param: actuatorClass === 'light' ? (newState.brightness !== undefined ? 'brightness' : 'value') :
             actuatorClass === 'fan' ? 'fan_speed' :
             actuatorClass === 'ac' ? 'mode' : 'setpoint',
      value: actuatorClass === 'light' ? (newState.brightness || newState.value || 1) :
             actuatorClass === 'fan' ? newState.fan_speed :
             actuatorClass === 'ac' ? newState.mode : newState.setpoint
    });
  } else if (wasOn && !isOn && cached) {
    // Выключение: вычисляем длительность и очищаем кэш
    const duration = now - cached.onTimestamp;
    actuatorStateCache.delete(id); // Очищаем кэш при выключении
    // Длительность будет добавлена в событие выключения
    return {
      onTimestamp: cached.onTimestamp,
      duration: duration,
      param: cached.param,
      value: cached.value
    };
  } else if (wasOn && isOn && cached) {
    // Устройство остаётся включённым - обновляем значение
    actuatorStateCache.set(id, {
      ...cached,
      value: actuatorClass === 'light' ? (newState.brightness || newState.value || 1) :
             actuatorClass === 'fan' ? newState.fan_speed :
             actuatorClass === 'ac' ? newState.mode : newState.setpoint
    });
  }
  
  return null;
};

// Генерация trace ID для трассировки событий
const generateTraceId = (id, context) => {
  // Если в контексте уже есть trace_id - используем его и сохраняем в кэш
  if (context && context.trace_id) {
    traceIdCache.set(id, context.trace_id);
    return context.trace_id;
  }
  
  // Если trigger не определён (unknown или null) - генерируем новый trace_id и сохраняем в кэш
  const triggerType = context?.type || 'unknown';
  if (triggerType === 'unknown' || !context?.ref) {
    // Проверяем, есть ли уже trace_id в кэше для этого ID
    if (traceIdCache.has(id)) {
      return traceIdCache.get(id);
    }
    
    // Генерируем новый trace_id и сохраняем в кэш
    const newTraceId = uuidv4();
    traceIdCache.set(id, newTraceId);
    return newTraceId;
  }
  
  // Если есть trigger (script, schedule, device, timer) - ищем trace_id в кэше по ref
  const triggerRef = context.ref;
  if (triggerRef && traceIdCache.has(triggerRef)) {
    // Нашли trace_id в кэше - используем его и сохраняем для текущего события
    const traceId = traceIdCache.get(triggerRef);
    traceIdCache.set(id, traceId);
    return traceId;
  }
  
  // Если trigger есть, но trace_id не найден в кэше - генерируем новый
  // Это может быть, если событие с trigger пришло раньше события без trigger
  const newTraceId = uuidv4();
  traceIdCache.set(id, newTraceId);
  // Также сохраняем для trigger.ref, чтобы связать цепочку
  if (triggerRef) {
    traceIdCache.set(triggerRef, newTraceId);
  }
  return newTraceId;
};

// Обработка ACTION_SET сообщений
const handleActionSet = (message) => {
  try {
    const { id, payload, _context } = message;
    
    if (!id || !payload || typeof payload !== 'object') {
      return;
    }
    
    // Получаем старое состояние
    const oldState = deviceState.get(id) || {};
    
    // Обновляем состояние
    const newState = { ...oldState, ...payload };
    deviceState.set(id, newState);
    
    // Обновляем state для использования в функциях event-log.js
    state.set(id, newState);
    
    // 1. Обновляем кэш имён устройств
    updateDeviceNameCache(id, newState);
    
    // 2. Обновляем кэш состояния актуаторов и получаем информацию о выключении
    const actuatorOffInfo = updateActuatorStateCache(id, oldState, newState);
    
    // Получаем контекст из _context или создаём пустой
    const context = _context || {
      type: 'unknown',
      ref: null,
      deviceId: null,
      session: null,
      remote_ip: null
    };
    
    // 3. Генерируем trace_id для трассировки
    const traceId = generateTraceId(id, context);
    context.trace_id = traceId;
    
    // Создаём чистый payload без timestamp для правильного сравнения
    const cleanPayload = { ...payload };
    delete cleanPayload.timestamp;
    
    // Обрабатываем событие (используем логику из event-log.js)
    processEvent(id, oldState, newState, context, cleanPayload, actuatorOffInfo);
    
  } catch (error) {
    logError('Ошибка обработки ACTION_SET:', error.message, error.stack);
  }
};

// Обработка события (логика из event-log.js)
const processEvent = (id, oldState, newState, context, changedPayload = null, actuatorOffInfo = null) => {
  if (!id || !newState || typeof newState !== 'object') return;
  
  // Если передан changedPayload, логируем только параметры из payload
  const paramsToCheck = changedPayload ? Object.keys(changedPayload) : null;
  
  // Специальная обработка для события запуска скрипта
  // Логируем событие запуска скрипта (executed, last_execution)
  if (newState.executed !== undefined || newState.last_execution !== undefined) {
    const param = newState.executed !== undefined ? 'executed' : 'last_execution';
    
    // Правильная обработка oldValue
    let oldValue = null;
    if (param === 'executed') {
      oldValue = oldState?.executed !== undefined ? oldState.executed : null;
    } else {
      oldValue = oldState?.last_execution !== undefined ? oldState.last_execution : null;
    }
    const newValue = newState.executed !== undefined ? newState.executed : (newState.last_execution || null);
    
    // Для executed и last_execution не применяем округление
    const roundedOldValue = oldValue !== null && oldValue !== undefined ? oldValue : null;
    const roundedNewValue = newValue !== null && newValue !== undefined ? newValue : null;
    
    // Для скриптов получаем site из родительской локации
    let siteName = getSiteName(id);
    if (!siteName && newState.parent) {
      siteName = getSiteName(newState.parent);
    }
    
    const triggerDeviceId = getTriggerDeviceId(context);
    
    // Получаем имя устройства из кэша
    const cachedName = deviceNameCache.get(id);
    
    const event = {
      timestamp: Date.now(),
      id,
      device: {
        type: null,
        human: cachedName?.human || getHumanName(newState),
        name: cachedName?.name || newState.name || null
      },
      param,
      old: roundedOldValue,
      new: roundedNewValue,
      trigger: {
        type: 'script', // Всегда 'script' для события запуска скрипта
        ref: context.ref || null,
        id: triggerDeviceId, // ID устройства-источника
        human: getTriggerHuman(context, triggerDeviceId),
        session: context.session || null,
        remote_ip: context.remote_ip || null
      },
      site: siteName || null,
      project: getProjectName(id),
      trace_id: context.trace_id || null, // Трассировка событий
      extra: {}
    };
    
    // Отправляем событие
    sendEvent(event);
    return; // Логируем только событие запуска скрипта
  }
  
  // Использование типизированной системы фильтров
  const allParams = filters.ALL_PARAMS;
  
  for (const param of allParams) {
    // Если передан changedPayload, проверяем только параметры из payload
    if (paramsToCheck && !paramsToCheck.includes(param)) {
      continue; // Параметр не был изменён в payload
    }
    
    const oldValue = oldState?.[param];
    const newValue = newState[param];
    
    // Проверка через типизированную систему фильтров
    if (!filters.shouldLogEvent(param, oldValue, newValue, id, isActuatorDevice)) {
      continue; // Фильтр отклонил событие
    }
    
    const deviceType = getDeviceTypeWithFallback(id);
    const deviceTypeStr = deviceType && typeof deviceType === 'number' 
      ? `DEVICE_TYPE_${deviceType.toString(16).toUpperCase()}` 
      : null;
    
    // Определяем валидность значений
    const oldIsValid = oldValue !== undefined && oldValue !== null && !(typeof oldValue === 'number' && Number.isNaN(oldValue));
    const newIsValid = newValue !== undefined && newValue !== null && !(typeof newValue === 'number' && Number.isNaN(newValue));
    
    // Округляем значения до десятых
    const roundedOldValue = oldIsValid ? roundToTenths(oldValue) : null;
    const roundedNewValue = newIsValid ? roundToTenths(newValue) : null;
    
    // Определяем, является ли параметр числовым
    const isNumeric = isNumericParam(param);
    
    const triggerDeviceId = getTriggerDeviceId(context);
    
    // Получаем имя устройства из кэша
    const cachedName = deviceNameCache.get(id);
    
    // Обогащаем событие информацией о выключении актуатора
    const extra = {};
    if (actuatorOffInfo && (param === 'value' || param === 'brightness' || param === 'fan_speed' || param === 'mode' || param === 'setpoint')) {
      // Если это событие выключения актуатора, добавляем информацию о длительности работы
      if (roundedNewValue === 0 || roundedNewValue === 'stop' || roundedNewValue === null) {
        extra.actuator_off = {
          on_timestamp: actuatorOffInfo.onTimestamp,
          duration_ms: actuatorOffInfo.duration,
          duration_seconds: Math.round(actuatorOffInfo.duration / 1000),
          param: actuatorOffInfo.param,
          value: actuatorOffInfo.value
        };
      }
    }
    
    const event = {
      timestamp: Date.now(),
      id,
      device: {
        type: deviceTypeStr,
        human: cachedName?.human || getHumanName(newState),
        name: cachedName?.name || newState.name || null
      },
      param,
      old: roundedOldValue,
      new: roundedNewValue,
      // Для числовых параметров добавляем value.old и value.new
      ...(isNumeric ? {
        value: {
          old: roundedOldValue,
          new: roundedNewValue
        }
      } : {}),
      trigger: {
        type: context.type || 'unknown',
        ref: context.ref || null,
        id: triggerDeviceId,
        human: getTriggerHuman(context, triggerDeviceId),
        session: context.session || null,
        remote_ip: context.remote_ip || null
      },
      site: getSiteName(id),
      project: getProjectName(id),
      trace_id: context.trace_id || null, // Трассировка событий
      extra
    };
    
    // Отправляем событие
    sendEvent(event);
  }
};

// Отправка события в OpenSearch или буфер
const sendEvent = (event) => {
  // Проверяем доступность OpenSearch
  if (opensearch.isEnabled && opensearch.isEnabled()) {
    // Отправляем напрямую
    opensearch.sendBatch([event]).catch(err => {
      logError('Ошибка отправки события в OpenSearch:', err.message);
      // При ошибке добавляем в буфер
      addToBuffer(event);
    });
  } else {
    // Добавляем в буфер
    addToBuffer(event);
  }
};

// Добавление события в буфер
const addToBuffer = (event) => {
  eventBuffer.push(event);
  
  // Если буфер переполнен, удаляем старые события
  if (eventBuffer.length > BUFFER_MAX_SIZE) {
    const removed = eventBuffer.shift();
    log(`Буфер переполнен, удалено старое событие: ${removed.id}/${removed.param}`);
  }
};

// Попытка отправить события из буфера
const flushBuffer = async () => {
  if (eventBuffer.length === 0) return;
  
  if (opensearch.isEnabled && opensearch.isEnabled()) {
    const eventsToSend = [...eventBuffer];
    eventBuffer = [];
    
    try {
      await opensearch.sendBatch(eventsToSend);
      log(`Отправлено ${eventsToSend.length} событий из буфера`);
    } catch (err) {
      logError('Ошибка отправки событий из буфера:', err.message);
      // Возвращаем события в буфер
      eventBuffer = [...eventsToSend, ...eventBuffer];
    }
  }
};

// Обработка LIST сообщения (получение списка ID устройств)
const handleList = (message) => {
  try {
    const { state: stateList } = message;
    
    if (!Array.isArray(stateList)) {
      log('LIST не содержит массив state');
      return;
    }
    
    log(`Получено ${stateList.length} ID устройств из LIST`);
    
    // LIST возвращает [[id, timestamp], ...], а не полные данные
    // Нужно запросить полные данные через GET
    const deviceIds = stateList.map(([id]) => id).filter(Boolean);
    
    if (deviceIds.length > 0) {
      log(`Запрашиваем полные данные для ${deviceIds.length} устройств через GET...`);
      
      // Запрашиваем полные данные через GET
      // GET принимает массив ID в поле state
      // GET вернёт серию ACTION_SET сообщений (по одному на каждое устройство)
      if (ws && ws.readyState === WebSocket.OPEN) {
        pendingGetRequests = deviceIds.length;
        ws.send(JSON.stringify({ type: GET, state: deviceIds }));
        
        // Таймаут для получения всех ответов
        setTimeout(() => {
          if (pendingGetRequests > 0) {
            log(`Предупреждение: получено не все ответы на GET (ожидалось ${deviceIds.length}, получено ${deviceIds.length - pendingGetRequests})`);
            stateRequested = false;
            isInitialStateReceived = true;
            pendingGetRequests = 0;
          }
        }, STATE_REQUEST_TIMEOUT);
      }
    } else {
      log('Нет устройств для запроса');
      stateRequested = false;
      isInitialStateReceived = true;
    }
  } catch (error) {
    logError('Ошибка обработки LIST:', error.message);
  }
};

// Флаг для отслеживания получения начального состояния
let isInitialStateReceived = false;
let pendingGetRequests = 0; // Счётчик ожидаемых ACTION_SET ответов на GET

// Запрос полного состояния при подключении
const requestFullState = () => {
  if (stateRequested) return;
  stateRequested = true;
  
  log('Запрашиваем полное состояние...');
  
  // Отправляем LIST для получения полного состояния
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: LIST }));
    
    // LIST вернёт полное состояние в формате { type: 'list', state: [[id, state], ...] }
    // После получения LIST мы обновим deviceState и state
  }
};

// Подключение к WebSocket
const connect = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return; // Уже подключено
  }
  
  log(`Подключение к ${DAEMON_WS_URL}...`);
  
  ws = new WebSocket(DAEMON_WS_URL);
  
  ws.on('open', () => {
    log('WebSocket подключен', 'URL:', DAEMON_WS_URL, 'readyState:', ws.readyState);
    isConnected = true;
    reconnectAttempts = 0;
    stateRequested = false;
    isInitialStateReceived = false;
    pendingGetRequests = 0;
    
    // Запрашиваем полное состояние
    requestFullState();
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      // Обрабатываем разные типы сообщений
      switch (message.type) {
        case LIST:
          handleList(message);
          isInitialStateReceived = true;
          break;
        case ACTION_SET:
          // Если это начальное состояние (без _context), обновляем deviceState
          // Иначе обрабатываем как событие изменения
          if (!isInitialStateReceived && !message._context) {
            // Это начальное состояние из GET (ответ на запрос полного состояния)
            const { id, payload } = message;
            if (id && payload && typeof payload === 'object') {
              deviceState.set(id, payload);
              state.set(id, payload);
              
              // Обновляем кэш имён устройств при загрузке начального состояния
              updateDeviceNameCache(id, payload);
              
              pendingGetRequests--;
              
              // Если все ответы получены, считаем начальное состояние загруженным
              if (pendingGetRequests <= 0) {
                log(`Восстановлено ${deviceState.size} состояний устройств`);
                log(`Загружено ${deviceNameCache.size} имён устройств в кэш`);
                stateRequested = false;
                isInitialStateReceived = true;
                pendingGetRequests = 0;
              }
            }
          } else {
            // Это событие изменения - обрабатываем
            handleActionSet(message);
          }
          break;
        default:
          // Игнорируем другие типы сообщений
          break;
      }
    } catch (error) {
      logError('Ошибка парсинга сообщения:', error.message, data.toString().substring(0, 100));
    }
  });
  
  ws.on('error', (error) => {
    logError('WebSocket ошибка:', error.message || error.toString() || JSON.stringify(error), error);
    isConnected = false;
  });
  
  ws.on('close', () => {
    log('WebSocket соединение закрыто');
    isConnected = false;
    stateRequested = false;
    isInitialStateReceived = false;
    pendingGetRequests = 0;
    
    // Пытаемся переподключиться
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      log(`Попытка переподключения ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} через ${RECONNECT_DELAY}мс...`);
      setTimeout(connect, RECONNECT_DELAY);
    } else {
      logError(`Достигнуто максимальное количество попыток переподключения (${MAX_RECONNECT_ATTEMPTS})`);
      process.exit(1);
    }
  });
};

// Graceful shutdown
const shutdown = () => {
  log('Получен сигнал завершения, завершаем работу...');
  
  // Останавливаем интервал
  if (bufferFlushInterval) {
    clearInterval(bufferFlushInterval);
  }
  
  // Отправляем события из буфера
  flushBuffer().then(() => {
    if (ws) {
      ws.close();
    }
    process.exit(0);
  }).catch(err => {
    logError('Ошибка при завершении:', err.message);
    process.exit(1);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Запуск
log('Запуск Event Logger Service...');
log(`Подключение к демону: ${DAEMON_WS_URL}`);
log(`OpenSearch включен: ${process.env.OPENSEARCH_ENABLED === 'true'}`);

// Периодически пытаемся отправить события из буфера
bufferFlushInterval = setInterval(flushBuffer, 5000); // Каждые 5 секунд

connect();

