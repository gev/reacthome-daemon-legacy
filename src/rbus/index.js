const { createPort } = require('./serial/create');
const { createSocket } = require('./udp/create');

module.exports.rbus = (host, path) => {
  const rbus = {};
  createSocket(rbus, host);
  createPort(rbus, path);
}
