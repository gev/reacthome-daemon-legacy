
const { get, set } = require('../../actions');
const { ACTION_SET_ADDRESS, ACTION_SET_FAN_SPEED, ACTION_ON, ACTION_OFF, ACTION_SET_MODE, ACTION_SET_DIRECTION, ACTION_SETPOINT } = require('../../constants');
const { writeRegister, readHoldingRegisters, writeRegisters } = require('../modbus');
const { READ_HOLDING_REGISTERS, WRITE_REGISTER } = require('../modbus/constants');
const { BROADCAST_ADDRESS, TIMEOUT } = require('./constants');
const { del } = require('../../db');
const { delay } = require('../../util');

const instance = new Set();

const sync = async (id, modbus, address, n) => {
  for (let i = 1; i <= n; i += 1) {
    const ch = `${id}/${ac}/${i}`
    const { synced, value } = get(ch) || {};
    if (!synced) {
      writeRegister(modbus, address, r + i * 5, value > 254 ? 254 : value);
      set(ch, { synced: true });
      await delay(50);
    }
  }
  // const dev = get(id) || {};
  // const { bind, synced } = dev;
  // const [modbus, , address] = bind.split('/');
  // if (synced) {
  //   readHoldingRegisters(modbus, address, 0x0, 12);
  // } else {
  //   writeRegister(modbus, address, 0x0, dev.value);
  //   await delay(100);
  //   writeRegister(modbus, address, 0x1, dev.mode);
  //   await delay(100);
  //   writeRegister(modbus, address, 0x2, dev.fan_speed);
  //   await delay(100);
  //   writeRegister(modbus, address, 0x3, dev.direction);
  //   await delay(100);
  //   writeRegister(modbus, address, 0x4, dev.setpoint);
  //   set(id, { synced: true });
  // }
};


const loop = (id) => async () => {
  const dev = get(id) || {};
  const { bind, numberAC } = dev;
  const [modbus, , address] = bind.split('/');
  await sync(id, modbus, address, numberAC);
  instance.set(id, setTimeout(loop(id), 100));
}


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
      set(id, { direction: action.value, synced: false });
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
  switch (data[0]) {
    case READ_HOLDING_REGISTERS: {
      const dev = get(id) || {};
      if (dev.synced) {
        set(id, {
          value: data.readUInt16BE(2),
          mode: data.readUInt16BE(4),
          fan_speed: data.readUInt16BE(6),
          direction: data.readUInt16BE(8),
          setpoint: data.readUInt16BE(10),
          synced: true
        })
      }
      break;
    }
  }
};


module.exports.clear = () => {
  instance.clear();
}

module.exports.add = (id) => {
  if (instance.has(id)) {
    clearTimeout(instance.get(id))
  }
  instance.set(id, setTimeout(loop(id), 100));
};

let index = 0;
