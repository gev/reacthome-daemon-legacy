const dgram = require('dgram');
const { DEVICE_PORT, DEVICE_SERVER_PORT } = require('../../constants');
const { handle } = require('./handle');

module.exports.createSocket = (rbus, host) => {
  const socket = dgram.createSocket('udp4');
  socket.bind(DEVICE_PORT, host);
  socket.on('message', handle(rbus));
  const send = (data) => {
    socket.send(
      Buffer.from(data),
      DEVICE_SERVER_PORT,
      '127.0.0.1'
    )
  };
  rbus.socket = {
    host,
    send: (data) => send(Buffer.from([
      ...rbus.mac, ...data
    ])),
    close: socket.close
  }
}
