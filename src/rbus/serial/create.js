const { SerialPort } = require('serialport');
const { addCRC } = require('../crc');
const { handle } = require('./handle');

const createPort = (rbus, path) => {
  const port = new SerialPort(
    { path, baudRate: 2_000_000, dataBits: 8, stopBits: 1, parity: 'none' }
  )
  port.on('data', handle(rbus));
  const send = (data) => {
    port.write(data)
  }
  rbus.port = {
    path,
    send: (data) => send(addCRC(data)),
    close: port.close,
    reCreate: () => {
      port.close();
      createPort(rbus, path);
    }
  };
}

module.exports.createPort = createPort;
