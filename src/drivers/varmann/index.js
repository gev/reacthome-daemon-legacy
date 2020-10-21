
const { get } = require('../../actions/create');
const { send } = require('../../sockets/device');
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
    const {bind: bind1} = get(id) || {};
    const [modbus,,address] = bind1.split('/') || '';
    const {bind: bind2} = get(modbus) || {};
    const [dev,,index] = bind2.split('/') || '';
    const {ip} = get(dev) || {};
    if (ip && index && address) {
      setTimeout(() => {
        console.log('write register');
        send(writeRegister(index, address, 0, i), ip);
      }, 1000);
      setTimeout(() => {
        console.log('write registers');
        send(writeRegisters(index, address, 0, [i + 1, i + 2]), ip);
      }, 2000);
      setTimeout(() => {
        console.log('read holding registers');
        send(readHoldingRegisters(index, address, 0, 2), ip);
      }, 3000);
      setTimeout(() => {
        console.log('read input registers');
        send(readInputRegisters(index, address, 0, 2), ip);
      }, 4000);
      i += 3;
    }
  }
}, 5000);