
const { crc16modbus } = require('crc');
const { get } = require('../../actions');
const { ACTION_RS485_TRANSMIT } = require('../../constants');
const { 
  READ_INPUT_REGISTERS,
  READ_HOLDING_REGISTERS, 
  WRITE_REGISTER,
  WRITE_REGISTERS,
  MODBUS,
} = require('./constants');
const driver = require('../driver');
const { send } = require('../../sockets/device');

const rtu = (getSize, fill) => (code) => (id, address, register, data) => {
  const {bind} = get(id) || {};
  const [dev,, index] = bind.split('/');
  const {ip} = get(dev) || {};
  if (ip && index) {
    const size = getSize(data);
    const buffer = Buffer.alloc(size + 2);
    buffer.writeUInt8(ACTION_RS485_TRANSMIT, 0);
    buffer.writeUInt8(index, 1);
    buffer.writeUInt8(address, 2);
    buffer.writeUInt8(code, 3);
    buffer.writeUInt16BE(register, 4);
    fill(buffer, data);
    buffer.writeUInt16LE(crc16modbus(buffer.slice(2, size)), size);
    console.log(buffer);
    send(buffer, ip);
  }
}

const rtu8 = rtu(
  () => 8, 
  (buffer, data) => {
    buffer.writeUInt16BE(data, 6);
  }
);

module.exports.readHoldingRegisters = rtu8(READ_HOLDING_REGISTERS);
module.exports.readInputRegisters = rtu8(READ_INPUT_REGISTERS);
module.exports.writeRegister = rtu8(WRITE_REGISTER);
module.exports.writeRegisters = rtu(
  (data) => 9 + 2 * data.length,
  (buffer, data) => {
    buffer.writeUInt16BE(data.length, 6);
    buffer.writeUInt8(2 * data.length, 8);
    for (let i = 0; i < data.length; i++) {
      buffer.writeUInt16BE(data[i], 2 * i + 9);
    }
  }
)(WRITE_REGISTERS);

module.exports.handle = ({id, data}) => {
  const address = data[0];
  const {bind} = get(`${id}/${MODBUS}/${address}`) || {};
  if (bind) {
    console.log(data);
    driver.handle({id: bind, data: data.slice(1)});
  }
}