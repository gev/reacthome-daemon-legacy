
const dgram = require('dgram');
const { 
  DEVICE_PORT,
  DISCOVERY_GROUP,
  ACTION_DISCOVERY,
  DISCOVERY_INTERVAL
} = require('./constants');

const socket = dgram.createSocket('udp4');

module.exports = (ip) => {
  const buff = Buffer.from([ACTION_DISCOVERY, ...ip.split('.').map(i => parseInt(i))]);
  setInterval(() => {
    socket.send(buff, DEVICE_PORT, DISCOVERY_GROUP);
  }, DISCOVERY_INTERVAL);
};
