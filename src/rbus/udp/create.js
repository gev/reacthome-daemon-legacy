const dgram = require('dgram');
const { DEVICE_PORT, DEVICE_SERVER_PORT, ACTION_INITIALIZE } = require('../../constants');
const { discovery } = require('./discovery');
const { handle } = require('./handle');

module.exports.createSocket = (rbus, host) => {
  const socket = dgram.createSocket('udp4');
  socket.bind(DEVICE_PORT, host);
  socket.on('message', handle(rbus));
  rbus.socket = {
    host,
    send: (data) => socket.send(
      Buffer.from([0, 0, 0, 0, 0, rbus.index, ...data]),
      DEVICE_SERVER_PORT,
      '127.0.0.1'
    ),
    close: socket.close
  }
  setInterval(discovery(rbus), 1000);
  rbus.socket.send([ACTION_INITIALIZE]);
}
