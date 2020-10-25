
const { get, set } = require('../../actions');
const { ACTION_SET_ADDRESS, ACTION_SET_FAN_SPEED } = require('../../constants');
const { writeRegister, readHoldingRegisters } = require('../modbus');
const { READ_HOLDING_REGISTERS, WRITE_REGISTER } = require('../modbus/constants');
const { BROADCAST_ADDRESS, TIMEOUT } = require('./constants');

const instance = new Set();

const write = (index, broadcast) => (action) => {
  const {id, value} = action;
  const {bind} = get(id) || {};
  const [modbus,, address] = bind.split('/');
  if (modbus) {
    writeRegister(modbus, broadcast || address, index, value);
  }
}

const read = (id) => {
  const {bind} = get(id) || {};
  const [modbus,, address] = bind.split('/');
  if (modbus && address) {
    readHoldingRegisters(modbus, address, 0x1, 24);
  }
};

const setAddress = write(0x0, BROADCAST_ADDRESS);
const setFanSpeed = write(0x6);

module.exports.handle = (action) => {
  switch (action.type) {
    case ACTION_SET_ADDRESS: {
      setAddress(action);
      break;
    }
    case ACTION_SET_FAN_SPEED: {
      setFanSpeed(action);
      break;
    }
    default: {
      const {id, data} = action;
      switch (data[0]) {
        case WRITE_REGISTER: {
          // setTimeout(() => {read(id)}, 10);
          break;
        }
        case READ_HOLDING_REGISTERS: {
          set(id, {fan_speed: data.readUInt16BE(13)})
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
    read(id);
  }
}, TIMEOUT);