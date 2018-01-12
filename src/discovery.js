
const memoize = require('fast-memoize');
const { PORT, MULTICAST_GROUP, ACTION_DISCOVERY } = require('./const');

const packet = memoize(ip => {
  const buff = ip
    .split('.')
    .map(i => parseInt(i));
  buff.unshift(ACTION_DISCOVERY);
  return Buffer.from(buff);
});

module.exports = (socket, ip) => {
  socket.send(packet(ip), PORT, MULTICAST_GROUP);
};
