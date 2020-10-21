
const { get } = require('../../actions/create');
const { writeRegister, writeRegisters, readHoldingRegisters, readInputRegisters } = require('../modbus');
const { BROADCAST_ADDRESS } = require('./constants');

const instance = new Set();

module.exports.handle = ({id, data}) => {
  console.log(id, data, get(id));
};

module.exports.clear = () => {
  instance.clear();
}

module.exports.add = (id) => {
  instance.add(id);
};

module.exports.setAddress = (action) => {
  const {id, address} = action;
  const {bind} = get(id) || {};
  const [modbus] = bind.split('/');
  if (modbus) {
    writeRegister(modbus, BROADCAST_ADDRESS, address);
  }
};

let i = 0;

setInterval(() => {
  for (const id of instance) {
    console.log(id);
    const {bind} = get(id) || {};
    const [modbus,, address] = bind.split('/');
    if (modbus && address) {
      setTimeout(() => {
        console.log('write register');
        writeRegister(modbus, address, 0, i);
      }, 1000);
      setTimeout(() => {
        console.log('write registers');
        writeRegisters(modbus, address, 0, [i + 1, i + 2]);
      }, 2000);
      setTimeout(() => {
        console.log('read holding registers');
        readHoldingRegisters(modbus, address, 0, 2);
      }, 3000);
      setTimeout(() => {
        console.log('read input registers');
        readInputRegisters(modbus, address, 0, 2);
      }, 4000);
      i += 3;
    }
  }
}, 5000);