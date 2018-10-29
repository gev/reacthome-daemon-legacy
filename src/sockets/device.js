
const {
  DISCOVERY_INTERVAL,
  ACTION_DISCOVERY,
  DEVICE_GROUP,
  DEVICE_PORT,
  SERVER_PORT,
  IP_ADDRESS,
} = require('../constants');
const socket = require('./socket');

module.exports = socket((socket) => {
  const data = Buffer.alloc(7);
  data.writeUInt8(ACTION_DISCOVERY, 0);
  data.writeUInt32BE(IP_ADDRESS, 1);
  data.writeUInt16BE(socket.address().port, 5);
  return () => {
    socket.send(data, DEVICE_PORT, DEVICE_GROUP, (err) => {
      if (err) console.error(err);
    })
  };
}, DISCOVERY_INTERVAL, DEVICE_PORT, SERVER_PORT);  
