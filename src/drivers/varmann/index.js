
const { get } = require('../../actions/create');
const { ACTION_SET_ADDRESS } = require('../../constants');
const { writeRegister, writeRegisters, readHoldingRegisters, readInputRegisters } = require('../modbus');
const { BROADCAST_ADDRESS } = require('./constants');

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
      console.log(id, data, get(id));
    }
  }
};

module.exports.clear = () => {
  instance.clear();
}

module.exports.add = (id) => {
  instance.add(id);
};

// let i = 0;

// setInterval(() => {
//   for (const id of instance) {
//     console.log(id);
//     const {bind} = get(id) || {};
//     const [modbus,, address] = bind.split('/');
//     if (modbus && address) {
//       setTimeout(() => {
//         console.log('write register');
//         writeRegister(modbus, address, 0, i);
//       }, 1000);
//       setTimeout(() => {
//         console.log('write registers');
//         writeRegisters(modbus, address, 0, [i + 1, i + 2]);
//       }, 2000);
//       setTimeout(() => {
//         console.log('read holding registers');
//         readHoldingRegisters(modbus, address, 0, 2);
//       }, 3000);
//       setTimeout(() => {
//         console.log('read input registers');
//         readInputRegisters(modbus, address, 0, 2);
//       }, 4000);
//       i += 3;
//     }
//   }
// }, 5000);