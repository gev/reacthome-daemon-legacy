
const { get } = require('../../actions/create');
const { writeRegister, writeRegisters, readHoldingRegisters, readInputRegisters } = require('../modbus');

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

let i = 0;

setInterval(() => {
  for (const id of instance) {
    console.log(id);
    const {bind} = get(id) || {};
    setTimeout(() => {
      console.log('write register');
      writeRegister(bind, 0, i);
    }, 1000);
    setTimeout(() => {
      console.log('write registers');
      writeRegisters(bind, 0, [i + 1, i + 2]);
    }, 2000);
    setTimeout(() => {
      console.log('read holding registers');
      readHoldingRegisters(bind, 0, 2);
    }, 3000);
    setTimeout(() => {
      console.log('read input registers');
      readInputRegisters(bind, 0, 2);
    }, 4000);
    i += 3;
  }
}, 5000);