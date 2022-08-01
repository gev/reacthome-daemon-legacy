const dgram = require('dgram');
const { DEVICE_PORT, DEVICE_GROUP } = require('../../constants');
const { handle } = require('./handle');

module.exports.createSocket = (rbus, host) => {
  const socket = dgram.createSocket('udp4');
  socket.bind(DEVICE_PORT, host, () => {
    socket.addMembership(DEVICE_GROUP);
  });
  socket.on('meaasge', handle(rbus));
  rbus.socket = {
    host,
    send: socket.send,
    close: socket.close
  }
}
