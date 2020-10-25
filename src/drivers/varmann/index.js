
const { get } = require('../../actions/create');
const { ACTION_SET_ADDRESS } = require('../../constants');
const { writeRegister, writeRegisters, readHoldingRegisters, readInputRegisters } = require('../modbus');
const { READ_HOLDING_REGISTERS } = require('../modbus/constants');
const { BROADCAST_ADDRESS, TIMEOUT } = require('./constants');

const instance = new Set();

const setAddress = (action) => {
  const {id, address} = action;
  const {bind} = get(id) || {};
  const [modbus] = bind.split('/');
  if (modbus) {
    writeRegister(modbus, BROADCAST_ADDRESS, 0, address);
  }
};

module.exports.handle = (action) => {
  switch (action.type) {
    case ACTION_SET_ADDRESS: {
      setAddress(action)
      break;
    }
    default: {
      const {id, data} = action;
      switch (data[0]) {
        case READ_HOLDING_REGISTERS: {
          console.log(id, data, get(id));
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
    const {bind} = get(id) || {};
    const [modbus,, address] = bind.split('/');
    if (modbus && address) {
      readHoldingRegisters(modbus, address, 0x1, 24);
    }
  }
}, TIMEOUT);