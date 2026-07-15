// Драйвер Hisense B544(E) — нативный Modbus RTU адаптер кондиционеров (Лучистое).
// По контракту intesisbox (singleton: run/handle/add/clear + setInterval), но с картой B544:
//   вкл/выкл  → COIL 0x0 (FC05, 0xFF00/0x0000)   [у intesisbox это holding — несовместимо]
//   уставка   → holding 0x0 (FC06)
//   режим     → holding 0x2 (FC06, с трансляцией)
//   вентил.   → holding 0x3 (FC06)
//   чтение    → FC04 input 0x1..0x8 (temp/setpoint/mode/fan) + FC02 discrete 0x0 (on/off)
// Контекст и обоснование — INC-066. Развёртывается на Pi Лучистого (оригинал демона на Pi).

const { get, set } = require('../../actions');
const {
  ACTION_SET_FAN_SPEED, ACTION_ON, ACTION_OFF, ACTION_SET_MODE, ACTION_SET_DIRECTION, ACTION_SETPOINT,
} = require('../../constants');
const { writeRegister, writeCoil, readInputRegisters, readInputs } = require('../modbus');
const { READ_INPUT_REGISTERS, READ_INPUTS } = require('../modbus/constants');
const {
  TIMEOUT, COIL_ONOFF, HOLD_SETPOINT, HOLD_MODE, HOLD_FAN, INPUT_TEMP, INPUT_COUNT,
  COIL_ON, COIL_OFF, SETPOINT_MIN, SETPOINT_MAX, MODE_TO_B544, MODE_FROM_B544,
} = require('./constants');
const { delay } = require('../../util');

const instance = new Set();

const sync = async (id) => {
  const dev = get(id) || {};
  const { bind, synced } = dev;
  if (!bind) return;
  const [modbus, , address] = bind.split('/');
  if (synced) {
    // Только чтение: блок статуса (FC04) + фактический on/off (FC02).
    readInputRegisters(modbus, address, INPUT_TEMP, INPUT_COUNT);
    await delay(100);
    readInputs(modbus, address, COIL_ONOFF, 1);
  } else {
    // Пуш накопленных команд. Guard'ы: не писать undefined и не трогать блок,
    // пока по каналу не было явной команды (свежее устройство остаётся нетронутым).
    if (dev.setpoint != null) {
      let sp = dev.setpoint;
      if (sp < SETPOINT_MIN) sp = SETPOINT_MIN;
      if (sp > SETPOINT_MAX) sp = SETPOINT_MAX;
      writeRegister(modbus, address, HOLD_SETPOINT, sp);
      await delay(100);
    }
    if (dev.mode != null && MODE_TO_B544[dev.mode] != null) {
      writeRegister(modbus, address, HOLD_MODE, MODE_TO_B544[dev.mode]);
      await delay(100);
    }
    if (dev.fan_speed != null && dev.fan_speed >= 0 && dev.fan_speed <= 3) {
      writeRegister(modbus, address, HOLD_FAN, dev.fan_speed);
      await delay(100);
    }
    if (dev.value != null) {
      writeCoil(modbus, address, COIL_ONOFF, dev.value ? COIL_ON : COIL_OFF);
    }
    set(id, { synced: true });
  }
};

module.exports.run = (action) => {
  const { id, type } = action;
  switch (type) {
    case ACTION_ON: {
      set(id, { value: true, synced: false });
      break;
    }
    case ACTION_OFF: {
      set(id, { value: false, synced: false });
      break;
    }
    case ACTION_SET_MODE: {
      set(id, { mode: action.value, synced: false });
      break;
    }
    case ACTION_SET_FAN_SPEED: {
      set(id, { fan_speed: action.value, synced: false });
      break;
    }
    case ACTION_SET_DIRECTION: {
      // B544 swing (holding 0x4) — не используется в базовом сценарии; принимаем, но не пишем.
      break;
    }
    case ACTION_SETPOINT: {
      set(id, { setpoint: action.value, synced: false });
      break;
    }
  }
};

module.exports.handle = (action) => {
  const { id, data } = action;
  const dev = get(id) || {};
  if (!dev.synced) return; // readback учитываем только в синхронизированном состоянии
  switch (data[0]) {
    case READ_INPUT_REGISTERS: {
      // Блок 0x1..0x8: temp@0x1(off2), setpoint@0x2(off4), mode@0x7(off14), fan@0x8(off16)
      if (data.length < 18) break;
      const b544mode = data.readUInt16BE(14);
      set(id, {
        temperature: data.readUInt16BE(2),
        setpoint: data.readUInt16BE(4),
        mode: MODE_FROM_B544[b544mode] != null ? MODE_FROM_B544[b544mode] : dev.mode,
        fan_speed: data.readUInt16BE(16),
        last_seen: Date.now(),
      });
      break;
    }
    case READ_INPUTS: {
      // FC02: data[2] — байт статуса, бит 0 = вкл/выкл
      if (data.length < 3) break;
      set(id, { value: (data[2] & 1) === 1, last_seen: Date.now() });
      break;
    }
  }
};

module.exports.clear = () => {
  instance.clear();
};

module.exports.add = (id) => {
  instance.add(id);
};

let index = 0;

setInterval(() => {
  const arr = Array.from(instance);
  if (arr.length > 0) {
    sync(arr[index % arr.length]);
    index++;
  }
}, TIMEOUT);
