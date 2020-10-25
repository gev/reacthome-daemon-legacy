
const { get, set } = require('../../actions');
const { ACTION_SET_ADDRESS, ACTION_SET_FAN_SPEED } = require('../../constants');
const { writeRegister, readHoldingRegisters } = require('../modbus');
const { READ_HOLDING_REGISTERS } = require('../modbus/constants');
const { BROADCAST_ADDRESS, TIMEOUT } = require('./constants');

const instance = new Set();

const sync = (id) => {
  const dev = get(id) || {};
  const {bind, synced} = dev;
  const [modbus,, address] = bind.split('/');
  if (modbus && address) {
    if (synced) {
      readHoldingRegisters(modbus, address, 0x0, 25);
    } else {
      if (dev.broadcast) {
        writeRegister(modbus, BROADCAST_ADDRESS, 0x0, dev.address);
      } else {
        writeRegister(modbus, address, 0x6, dev.fan_speed);
      }
    }
  }
};

const setAddress = write(0x0, BROADCAST_ADDRESS);

module.exports.handle = (action) => {
  switch (action.type) {
    case ACTION_SET_ADDRESS: {
      set(id, {address: action.value, synced: false, broadcast: true})
      break;
    }
    case ACTION_SET_FAN_SPEED: {
      set(id, {fan_speed: action.value, synced: false});
      break;
    }
    default: {
      const {id, data} = action;
      switch (data[0]) {
        case READ_HOLDING_REGISTERS: {
          set(id, {fan_speed: data.readUInt16BE(14), synced: true})
          break;
        }
      }
    }
  }
};

module.exports.clear = () => {
  instance.clear();
}

module.exports.add = (id) => {
  instance.add(id);
};

setInterval(() => {
  for (const id of instance) {
    sync(id);
  }
}, TIMEOUT);