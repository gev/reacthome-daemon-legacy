
const {
  DISCOVERY_INTERVAL,
  ACTION_DISCOVERY,
  DEVICE_GROUP,
  DEVICE_PORT,
  IP_ADDRESS,
} = require('../constants');

const { createSocket } = require('dgram');

const socket = createSocket('udp4')

const send = (packet, ip) => {
  socket.send(packet, DEVICE_PORT, ip);
};

const sendConfirm = (packet, ip, confirm, t = 1000) => {
  if (confirm()) return;
  send(packet, ip);
  setTimeout(sendConfirm, t, packet, ip, confirm, t);
};

socket
  .on('error', console.error)
  .bind(() => {
    const data = Buffer.alloc(7);
    data.writeUInt8(ACTION_DISCOVERY, 0);
    data.writeUInt32BE(IP_ADDRESS, 1);
    data.writeUInt16BE(socket.address().port, 5);
    setInterval(send, DISCOVERY_INTERVAL, data, DEVICE_GROUP);
  });

  const handle = (handler) => {
    socket.on('message', handler)
  }

  module.exports = { handle, send, sendConfirm };