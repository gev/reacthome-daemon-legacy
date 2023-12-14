const { createPort } = require('./serial/create');
const { createSocket } = require('./udp/create');

module.exports.rbus = (mac, host, path) => {
  const rbus = { mac, pool: {} };
  createSocket(rbus, host);
  createPort(rbus, path);
}
