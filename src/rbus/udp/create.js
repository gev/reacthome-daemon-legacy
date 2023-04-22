const dgram = require('dgram');
const { DEVICE_PORT, DEVICE_SERVER_PORT, ACTION_READY, ACTION_DISCOVERY, DEVICE_TYPE_RS_HUB4 } = require('../../constants');
const { handle } = require('./handle');

module.exports.createSocket = (rbus, host) => {
  const socket = dgram.createSocket('udp4');
  socket.bind(DEVICE_PORT, host);
  socket.on('message', handle(rbus));
  const send = (data) => {
    console.log("UDP send", data)
    socket.send(
      data,
      DEVICE_SERVER_PORT,
      '127.0.0.1'
    )
  }
  rbus.socket = {
    host, send,
    close: socket.close
  }
  setInterval(() => {
    rbus.socket.send(Buffer.from([
      ...rbus.mac,
      rbus.ready ? ACTION_READY : ACTION_DISCOVERY,
      DEVICE_TYPE_RS_HUB4,
      1, 0 // Version
    ]))
  }, 1_000)
}
