
const {
  DISCOVERY_INTERVAL,
  ACTION_DISCOVERY,
  DEVICE_GROUP,
  DEVICE_PORT,
  DEVICE_SERVER_PORT,
  IP_ADDRESS,
} = require('../constants');
const socket = require('./socket');

const device = socket((socket) => {
  const data = Buffer.alloc(7);
  data.writeUInt8(ACTION_DISCOVERY, 0);
  data.writeUInt32BE(IP_ADDRESS, 1);
  data.writeUInt16BE(socket.address().port, 5);
  return () => {
    device.send(data, DEVICE_GROUP);
  };
}, DISCOVERY_INTERVAL, DEVICE_PORT, DEVICE_SERVER_PORT, '192.168.18.3', true);

module.exports = device;
