
const { crc16modbus } = require('crc');
const {get} = require('../actions');
const { ACTION_RS485_TRANSMIT } = require('../constants');
const { send } = require('../sockets/device');

module.exports.readCoils = (id, address, length) => {
};

module.exports.readDiscreteInputs = (address, length) => {
};

module.exports.readHoldingRegisters = (id, address, length) => {
};

module.exports.readInputRegisters = (id, address, length) => {
};

module.exports.writeCoil = (id, address, state) => {
};

module.exports.writeCoils = (id, address, array) => {
};

module.exports.writeRegister = (id, address, value) => {
  // const {ip} = get(id);
  // const buffer = Buffer.alloc();
  // buffer.writeUInt8(ACTION_RS485_TRANSMIT, 0);
  // buffer.writeUInt8(1, 0);
  // send(buffer, ip);
};

module.exports.writeRegisters = (id, address, array) => {
};

let i = 0;

module.exports.start = () => {
  setInterval(() => {
    const buffer = Buffer.alloc(10);
    buffer.writeUInt8(ACTION_RS485_TRANSMIT, 0);
    buffer.writeUInt8(1, 1);
    buffer.writeUInt8(11, 2);
    buffer.writeUInt8(0x6, 3);
    buffer.writeUInt16BE(1, 4);
    buffer.writeUInt16BE(3, 6);
    buffer.writeUInt16BE(crc16modbus(buffer.slice(2, 8)), 8);
    console.log(buffer);
    send(buffer, '172.16.0.14');
  }, 1000);
};

