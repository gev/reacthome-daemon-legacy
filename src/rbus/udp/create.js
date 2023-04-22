const dgram = require('dgram');
const { DEVICE_PORT, DEVICE_SERVER_PORT, ACTION_INITIALIZE } = require('../../constants');
const { discovery } = require('./discovery');
const { handle } = require('./handle');
const { addCRC } = require('../crc');

module.exports.createSocket = (rbus, host) => {
  const socket = dgram.createSocket('udp4');
  socket.bind(DEVICE_PORT, host);
  socket.on('message', handle(rbus));
  const send = (data) => {
    buffer = Buffer.alloc(data.length + 3)
    buffer.writeUint8(0xa5, 0)
    buffer.copy(data, 1)
    addCRC(buffer)
    socket.send(buffer, DEVICE_SERVER_PORT, '127.0.0.1')
  };
  rbus.socket = {
    host,
    sendRBUS: send,
    send: (data) => send(Buffer.from([
      ...rbus.mac, ...data
    ])),
    close: socket.close
  }
  setInterval(discovery(rbus), 1000);
  rbus.socket.send([ACTION_INITIALIZE]);
}
