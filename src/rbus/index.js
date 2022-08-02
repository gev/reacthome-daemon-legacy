const { Gpio } = require('onoff');
const { createPort } = require('./serial/create');
const { createSocket } = require('./udp/create');

module.exports.rbus = (index, host, path, rede) => {
  const rbus = {
    index,
    pool: [],
    rede: new Gpio(rede, 'out'),
  };
  createSocket(rbus, host);
  createPort(rbus, path, true);
}