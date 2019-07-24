
const { exists, createWriteStream } = require('fs');
const fetch = require('node-fetch');
const crypto = require('crypto');
const ircodes = require('reacthome-ircodes');
const drivers = require('../drivers');
const {
  VERSION,
  asset,
  AC,
  TV,
  DO,
  DIM,
  ARTNET,
  ACTION_DO,
  ACTION_DOPPLER,
  ACTION_DIMMER,
  ACTION_ARTNET,
  ACTION_DISCOVERY,
  ACTION_FIND_ME,
  ACTION_BOOTLOAD,
  ACTION_INIT,
  ACTION_SET,
  ACTION_DOWNLOAD,
  ACTION_RGB,
  ACTION_IR,
  ACTION_RGB_DIM,
  ACTION_ON,
  ACTION_OFF,
  ACTION_RS485_MODE,
  ACTION_RBUS_TRANSMIT,
  ACTION_DIM,
  ACTION_ENABLE,
  ACTION_DISABLE,
  ACTION_DIM_RELATIVE,
  ACTION_SITE_LIGHT_DIM_RELATIVE,
  ACTION_SITE_LIGHT_OFF,
  ACTION_SETPOINT,
  ACTION_TIMER_START,
  ACTION_TIMER_STOP,
  ACTION_CLOCK_START,
  ACTION_CLOCK_STOP,
  ACTION_CLOCK_TEST,
  ACTION_NIGHT_TEST,
  ACTION_DAY_TEST,
  ACTION_DOPPLER_HANDLE,
  ACTION_THERMOSTAT_HANDLE,
  ACTION_TOGGLE,
  ACTION_TV,
  ACTION_LEAKAGE_RESET,
  ACTION_SCRIPT_RUN,
  DEVICE_PORT,
  DEVICE_TYPE_DIM4,
  DEVICE_TYPE_DIM8,
  DEVICE_TYPE_DIM_8,
  DEVICE_TYPE_RELAY_6,
  DEVICE_TYPE_RELAY_12,
  DEVICE_TYPE_RELAY_24,
  DEVICE_TYPE_IR_4,
  DRIVER_TYPE_ARTNET,
  DRIVER_TYPE_BB_PLC1,
  DRIVER_TYPE_BB_PLC2,
  DISCOVERY_INTERVAL,
  DAEMON,
  MOBILE,
  DEVICE,
  SERVICE,
  CLIENT_PORT,
  CLIENT_GROUP,
  ON,
  OFF,
  DIM_ON,
  DIM_OFF,
  DIM_SET,
  DIM_FADE,
  DIM_TYPE,
  DIM_TYPE_RELAY,
  DIM_TYPE_FALLING_EDGE,
  DIM_TYPE_RISING_EDGE,
  DIM_TYPE_PWM,
  ARTNET_ON,
  ARTNET_OFF,
  ARTNET_SET,
  ARTNET_FADE,
  ARTNET_CONFIG,
  ARTNET_TYPE,
  ARTNET_TYPE_DIMMER,
  ARTNET_TYPE_RELAY,
  ARTNET_TYPE_PWM,
  ACTION_PNP,
  PNP_ENABLE,
  PNP_STEP,
  OPERATOR_PLUS,
  OPERATOR_MINUS,
  OPERATOR_MUL,
  OPERATOR_DIV,
  OPERATOR_LT,
  OPERATOR_LE,
  OPERATOR_EQ,
  OPERATOR_NE,
  OPERATOR_GE,
  OPERATOR_GT,
  STATE,
  ASSETS,
  STOP,
  HEAT,
  COOL
} = require('../constants');
const {
  get,
  set,
  add,
  offline,
  online,
  applySite,
  pendingFirmware,
  updateFirmware
} = require('../actions');
const { device, service } = require('../sockets');
const mac = require('../mac');
const { ac } = require('../drivers');

const timer = {};

const DIM_VELOCITY = 128;
const ARTNET_VELOCITY = 1;

const download = (ip, name) => {
  const file = asset(name);
  exists(file, (ex) => {
    if (ex) return;
    fetch(`http://${ip}:${CLIENT_PORT}/${ASSETS}/${name}`)
      .then(res => {
        if (res.status !== 200) return;
        const ws = createWriteStream(file);
        ws.on('end', () => {
          service.broadcast(JSON.stringify({ id: mac(), type: ACTION_DOWNLOAD, name: name }));
        });
        res.body.pipe(ws);
      })
      .catch(console.error);
  });
};

const init = (ip) => {
  fetch(`http://${ip}:${CLIENT_PORT}/${STATE}/${mac()}`)
    .then(response => response.json())
    .then(({ assets = [], state = {} }) => {
      assets.forEach((name) => {
        download(ip, name);
      });
      Object.entries(state).forEach(([k, v]) => {
        if (k === mac()) {
          v.online = true;
          v.type = DAEMON;
          v.version = VERSION;
        }
        set(k, v);
      });
      drivers.manage();
    })
    .catch(console.error);
};

const run = (action, address) => {
  try {
    switch (action.type) {
      case ACTION_INIT: {
        init(address);
        break;
      }
      case ACTION_SET: {
        const { id, payload } = action;
        set(id, payload);
        break;
      }
      case ACTION_DISCOVERY: {
        const { id, payload } = action;
        const { multicast, type, version, ready } = payload;
        if (multicast) {
          service.delUnicast(address);
        } else {
          service.addUnicast(address);
        }
        if (id && type !== MOBILE) {
          set(id, { online: true, ip: address, type, multicast, version, ready });
          add(mac(), DEVICE, id);
          clearTimeout(timer[id]);
          timer[id] = setTimeout(() => {
            set(id, { online: false });
          }, 60 * DISCOVERY_INTERVAL);
        }
        break;
      }
      case ACTION_BOOTLOAD: {
        pendingFirmware(action.id, action.pendingFirmware);
        break;
      }
        case ACTION_FIND_ME: {
        const dev = get(action.id);
        device.send(Buffer.from([ACTION_FIND_ME, action.finding]), dev.ip);
        break;
      }
      case ACTION_DO: {
        const dev = get(action.id);
        const id = `${action.id}/${DO}/${action.index}`
        switch (dev.type) {
          case DRIVER_TYPE_BB_PLC1:
          case DRIVER_TYPE_BB_PLC2: {
            drivers.handle(action);
            break;
          }
          default: {
            device.send(Buffer.from([ACTION_DO, action.index, action.value]), dev.ip);
          }
        }
        break;
      }
      case ACTION_DOPPLER: {
        const dev = get(action.id);
        device.send(Buffer.from([ACTION_DOPPLER, action.gain]), dev.ip);
        break;
      }
      case ACTION_DIMMER: {
        const dev = get(action.id) || {};
        const id = `${action.id}/${DIM}/${action.index}`;
        let velocity = DIM_VELOCITY;
        if (dev.type === DRIVER_TYPE_ARTNET) {
          velocity = ARTNET_VELOCITY;
        }
        switch (action.action) {
          case DIM_SET:
            device.send(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value]), dev.ip);
            break;
          case DIM_TYPE:
            device.send(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value]), dev.ip);
            break;
          case DIM_FADE:
            device.send(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value, velocity]), dev.ip);
            break;
          case DIM_ON:
            device.send(Buffer.from([ACTION_DIMMER, action.index, action.action]), dev.ip);
            break;
        case DIM_OFF:
          device.send(Buffer.from([ACTION_DIMMER, action.index, action.action]), dev.ip);
            break;
        }
        break;
      }
      case ACTION_ARTNET: {
        drivers.handle(action);
        break;
      }
      case ACTION_PNP: {
        const dev = get(action.id);
        set(action.id, { t0: Date.now() });
        switch (action.action) {
          case PNP_ENABLE:
            device.send(Buffer.from([ACTION_PNP, PNP_ENABLE, action.enabled]), dev.ip);
            break;
          case PNP_STEP:
            const buff = Buffer.alloc(5);
            buff.writeUInt8(ACTION_PNP, 0);
            buff.writeUInt8(PNP_STEP, 1);
            buff.writeUInt8(action.direction, 2);
            buff.writeUInt16BE(action.step, 3);
            device.send(buff, dev.ip);
            break;
        }
        break;
      }
      case ACTION_RGB_DIM: {
        const { id, value } = action;
        const { ip } = get(id);
        device.send(Buffer.from([ACTION_RGB, 0, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff ]), ip);
        set(id, { rgb: value });
        break;
      }
      case ACTION_ENABLE:
      case ACTION_ON: {
        const { id } = action;
        const { bind, last, type: payloadType } = get(id) || {};
        const { velocity, type } = get(bind) || {};
        const [dev,,index] = bind.split('/');
        const { ip, type: deviceType } = get(dev);
        const value = last || 255
        switch (deviceType) {
          case DEVICE_TYPE_DIM4:
          case DEVICE_TYPE_DIM8:
          case DEVICE_TYPE_DIM_8: {
            switch (type) {
              case DIM_TYPE_PWM:
              case DIM_TYPE_RISING_EDGE:
              case DIM_TYPE_FALLING_EDGE: {
                device.send(Buffer.from([ACTION_DIMMER, index, DIM_FADE, value, DIM_VELOCITY]), ip);
                break;
              }
              default: {
                device.send(Buffer.from([ACTION_DO, index, ON]), ip);
              }
            }
            break;
          }
          case DRIVER_TYPE_ARTNET: {
            switch (type) {
              case ARTNET_TYPE_DIMMER:
                drivers.handle({ id: dev, index, action: ARTNET_FADE, value, velocity: ARTNET_VELOCITY });
              break;
              default:
                drivers.handle({ id: dev, index, type: ACTION_DO, value: ON, velocity: ARTNET_VELOCITY });
            }
            break;
          }
          case DRIVER_TYPE_BB_PLC1:
          case DRIVER_TYPE_BB_PLC2: {
            drivers.handle({ id: dev, index, value: ON });
            break;
          }
          default: {
            switch (payloadType) {
              case AC: {
                ac.handle(action);
                break;
              }
              default: {
                device.send(Buffer.from([ACTION_DO, index, ON]), ip);
              }
            }
          }
        }
        break;
      }
      case ACTION_DISABLE:
      case ACTION_OFF: {
        const { id } = action;
        const { bind, type: payloadType } = get(id) || {};
        const { velocity = 128, type } = get(bind) || {};
        const [dev,,index] = bind.split('/');
        const { ip, type: deviceType } = get(dev);
        switch (deviceType) {
          case DEVICE_TYPE_DIM4:
          case DEVICE_TYPE_DIM8:
          case DEVICE_TYPE_DIM_8: {
            switch (type) {
              case DIM_TYPE_PWM:
              case DIM_TYPE_RISING_EDGE:
              case DIM_TYPE_FALLING_EDGE:
                device.send(Buffer.from([ACTION_DIMMER, index, DIM_FADE, 0, DIM_VELOCITY]), ip);
                break;
              default:
                device.send(Buffer.from([ACTION_DO, index, OFF]), ip);
            }
            break;
          }
          case DRIVER_TYPE_ARTNET: {
            switch (type) {
              case ARTNET_TYPE_DIMMER:
                drivers.handle({ id: dev, index, action: ARTNET_FADE, value: 0, velocity: ARTNET_VELOCITY });
              break;
              default:
                drivers.handle({ id: dev, index, type: ACTION_DO, value: OFF, velocity: ARTNET_VELOCITY });
            }
            break;
          }
          case DRIVER_TYPE_BB_PLC1:
          case DRIVER_TYPE_BB_PLC2: {
            drivers.handle({ id: dev, index, value: OFF });
            break;
          }
          default: {
            switch (payloadType) {
              case AC: {
                ac.handle(action);
                break;
              }
              default: {
                device.send(Buffer.from([ACTION_DO, index, OFF]), ip);
              }
            }
          }
        }
        break;
      }
      case ACTION_DIM: {
        const { id, value } = action;
        const { bind } = get(id);
        const { velocity = 128 } = get(bind);
        const [dev,,index] = bind.split('/');
        const { ip, type: deviceType } = get(dev);
        switch (deviceType) {
          case DEVICE_TYPE_DIM4:
          case DEVICE_TYPE_DIM8:
          case DEVICE_TYPE_DIM_8: {
            device.send(Buffer.from([ACTION_DIMMER, index, DIM_FADE, value, DIM_VELOCITY]), ip);
            set(id, { last: value });
            break;
          }
          case DRIVER_TYPE_ARTNET: {
            drivers.handle({ id: dev, index, action: ARTNET_FADE, value, velocity: ARTNET_VELOCITY });
            set(id, { last: value });
            break;
          }
        }
        break;
      }
      case ACTION_DIM_RELATIVE: {
        const { id, operator } = action;
        const { bind } = get(id);
        const { value } = get(bind);
        let v;
        switch (operator) {
          case OPERATOR_PLUS:
            v = Math.round(value + Number(action.value));
            break;
          case OPERATOR_MINUS:
            v = Math.round(value - Number(action.value));
            break;
            case OPERATOR_MUL:
            v = Math.round(value * Number(action.value));
            break;
            case OPERATOR_DIV:
            v = Math.round(value / Number(action.value))
            break;
        }
        if (v < 0) v = 0;
        if (v > 255) v = 255;
        if (v === value) return;
        run({ type: ACTION_DIM, id, value: v });
        break;
      }
      case ACTION_SITE_LIGHT_DIM_RELATIVE: {
        const { id, operator, value } = action;
        applySite(id, ({ light_220 = [], light_LED = [] }) => {
          light_220.map(i => run({ type: ACTION_DIM_RELATIVE, id: i, operator, value }));
          light_LED.map(i => run({ type: ACTION_DIM_RELATIVE, id: i, operator, value }));
        });
        break;
      }
      case ACTION_SITE_LIGHT_OFF: {
        const { id } = action;
        applySite(id, ({ light_220 = [], light_LED = [] }) => {
          light_220.map(i => run({ type: ACTION_OFF, id: i }));
          light_LED.map(i => run({ type: ACTION_OFF, id: i }));
        });
        break;
      }
      case ACTION_RS485_MODE: {
        const { id, index, is_rbus, baud, line_control } = action
        const { ip } = get(id) || {};
        const buffer = Buffer.alloc(8);
        buffer[0] = ACTION_RS485_MODE;
        buffer[1] = index;
        buffer[2] = is_rbus;
        buffer.writeUInt32LE(baud, 3);
        buffer[7] = line_control;
        device.send(buffer, ip);
        break;
      }
      case ACTION_SETPOINT: {
        const { id, value } = action;
        set(id, { setpoint: value });
        break;
      }
      case ACTION_TIMER_START: {
        const { id, script, time } = action;
        clearTimeout(timer[id]);
        timer[id] = setTimeout(() => {
          set(id, { time: 0, state: false });
          run({ type: ACTION_SCRIPT_RUN, id: script });
        }, parseInt(time));
        set(id, { time, script, state: true, timestamp: Date.now() });
        break;
      }
      case ACTION_TIMER_STOP: {
        const { id } = action;
        clearTimeout(timer[id]);
        set(id, { time: 0, state: false });
        break;
      }
      case ACTION_CLOCK_START: {
        const { id } = action;
        const { state } = get(id);
        if (!state) {
          set(id, { timestamp: Date.now(), state: true });
        }
        break;
      }
      case ACTION_CLOCK_STOP: {
        const { id } = action;
        const { state } = get(id);
        if (state) {
          set(id, { timestamp: Date.now(), state: false });
        }
        break;
      }
      case ACTION_CLOCK_TEST: {
        const { id, time, onTrue, onFalse, operator } = action;
        const { timestamp, state } = get(id);
        const t = Date.now() - timestamp;
        let script;
        if (state) {
          switch (operator) {
            case OPERATOR_LT: {
              script = t < time ? onTrue : onFalse;
              break;
            }
            case OPERATOR_LE: {
              script = t <= time ? onTrue : onFalse;
              break;
            }
            case OPERATOR_EQ: {
              script = t === time ? onTrue : onFalse;
              break;
            }
            case OPERATOR_NE: {
              script = t !== time ? onTrue : onFalse;
              break;
            }
            case OPERATOR_GE: {
              script = t >= time ? onTrue : onFalse;
              break;
            }
            case OPERATOR_GT: {
              script = t > time ? onTrue : onFalse;
              break;
            }
          }
          if (script) {
            run({ type: ACTION_SCRIPT_RUN, id: script });
          }
        }
        break;
      }
      case ACTION_DAY_TEST: {
        const { project } = get(mac);
        if (project) {
          const { weather } = get(project);
          if (weather && weather.sys) {
            const { sunrise, sunset } = weather.sys;
            const { onFalse, onTrue } = action;
            const now = Date.now();
            const script = now > sunrise && now < sunset ? onTrue : onFalse;
            if (script) {
              run({ type: ACTION_SCRIPT_RUN, id: script });
            }
          }
        }
        break;
      }
      case ACTION_NIGHT_TEST: {
        const { project } = get(mac());
        if (project) {
          const { weather } = get(project);
          if (weather && weather.sys) {
            const { sunrise, sunset } = weather.sys;
            const { onFalse, onTrue } = action;
            const now = Date.now();
            const script = now < sunrise || now > sunset ? onTrue : onFalse;
            if (script) {
              run({ type: ACTION_SCRIPT_RUN, id: script });
            }
          }
        }
        break;
      }
      case ACTION_DOPPLER_HANDLE: {
        const { id, low, high, onQuiet, onLowThreshold, onHighThreshold } = action;
        const { active } = get(action.action);
        const { value } = get(id);
        if (value >= high) {
          set(action.action, { active: true });
          if (onHighThreshold) {
            run({ type: ACTION_SCRIPT_RUN, id: onHighThreshold });
          }
          if (onLowThreshold) {
            run({ type: ACTION_SCRIPT_RUN, id: onLowThreshold });
          }
        } else if (value >= low) {
          set(action.action, { active: true });
          if (onLowThreshold) {
            run({ type: ACTION_SCRIPT_RUN, id: onLowThreshold });
          }
        } else if (active) {
          set(action.action, { active: false });
          if (onQuiet) {
            run({ type: ACTION_SCRIPT_RUN, id: onQuiet });
          }
        }
        break;
      }
      case ACTION_THERMOSTAT_HANDLE: {
        const {
            id,
            cool_hysteresis, cool_threshold, heat_hysteresis, heat_threshold,
            onStartHeat, onStartCool, onStopHeat, onStopCool
        } = action
        const { setpoint, sensor, state, mode, site } = get(id);
        const { temperature } = get(sensor);
        const make = (state, script, mode) => () => {
          set(id, { state, mode });
          if (script) {
            run({ type: ACTION_SCRIPT_RUN, id: script });
          }
        };
        const stopCool = make(STOP, onStopCool, mode);
        const stopHeat = make(STOP, onStopHeat, mode);
        const startCool = make(COOL, onStartCool, COOL);
        const startHeat = make(HEAT, onStartHeat, HEAT);
        set(site, { temperature });
        if (temperature > setpoint - (- heat_threshold)) {
          stopHeat();
          startCool();
        } else if (temperature < setpoint - cool_threshold) {
          stopCool();
          startHeat();
        } else {
          switch (mode) {
            case HEAT: {
              // stopCool();
              if (temperature < setpoint - heat_hysteresis) {
                stopCool();
                startHeat();
              } else if (temperature > setpoint - (- heat_hysteresis)) {
                stopHeat();
              }
              break;
            }
            case COOL: {
              // stopHeat();
              startCool();
              // stopHeat();
              // if (temperature > setpoint - (- cool_hysteresis)) {
              //   stopHeat();
              //   startCool();
              // } else if (temperature < setpoint - cool_hysteresis) {
              //   stopCool();
              // }
              break;
            }
            default: {
              if (temperature > setpoint) {
                stopHeat();
                startCool();
              } else if (temperature < setpoint) {
                stopCool();
                startHeat();
              } else {
                stopCool();
                stopHeat();
              }
            }
          }
        }
        break;
      }
      case ACTION_TOGGLE: {
        const { test = [], onOn, onOff } = action;
        const f = test.reduce((a, b) => {
          const { bind } = get(b) || {};
          if (bind) {
            return a || (get(bind) || {}).value
          }
          return a;
        }, false);
        if (f) {
          if (onOff) {
            run({ type: ACTION_SCRIPT_RUN, id: onOff });
          }
        } else {
          if (onOn) {
            run({ type: ACTION_SCRIPT_RUN, id: onOn });
          }
        }
        break;
      }
      case ACTION_TV: {
        const { id, command, repeat } = action;
        const { bind, brand, model } = get(id);
        const [dev,,index] = bind.split('/');
        const { ip, type } = get(dev);
        ircodes.getCode(TV, brand, model, command)
          .then(({ frequency, offset, data }) => {
            if (!data) return;
            let length = offset > 1 ? offset : data.length;
            let start = 0;
            if (repeat) {
              start = offset - 1;
              length = data.length - offset + 1;
            }
            const buff = Buffer.alloc(length * 2 + 5);
            buff.writeUInt8(ACTION_IR, 0);
            buff.writeUInt8(index, 1);
            buff.writeUInt8(0, 2);
            buff.writeUInt16BE(frequency, 3);
            for (let i = 0; i < length; i++) {
              buff.writeUInt16BE(data[i + start], i * 2 + 5);
            }
            switch (type) {
              case DEVICE_TYPE_IR_4:
                  const header = Buffer.alloc(7);
                  header.writeUInt8(ACTION_RBUS_TRANSMIT, 0);
                  dev.split(':').forEach((v, i)=> {
                    header.writeUInt8(parseInt(v, 16), i + 1);
                  });
                  device.send(Buffer.concat([header, buff]), ip);
                break;
              default:
                device.send(buff, ip);
              }
          })
          .catch(console.error);
      }
      case ACTION_LEAKAGE_RESET: {
        const {onLeakageReset} = get(id);
        set(action.id, { value: 0 });
        if (onLeakageReset) {
          run({ action: ACTION_SCRIPT_RUN, id: onLeakageReset });
        }
        break;
      }
      case ACTION_SCRIPT_RUN: {
        const { id } = action;
        const script = get(id);
        if (script && Array.isArray(script.action)) {
          script.action.forEach(i => {
            const { type, payload } = get(i);
            run({ action: i, type, ...payload });
          })
        }
        break;
      }
    }
  } catch(e) {
    console.error(e);
  }
};

module.exports.manage = () => {
    service.handle((data, { address }) => {
      try {
        run(JSON.parse(data), address);
      } catch (err) {
        console.error(err);
      }
    });
}

module.exports.run = run;
