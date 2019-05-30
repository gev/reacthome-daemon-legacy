
const {
  VERSION,
  DAEMON,
  DISCOVERY_INTERVAL,
  ACTION_DISCOVERY,
  CLIENT_GROUP,
  CLIENT_PORT,
  CLIENT_SERVER_PORT
} = require('../constants');
const socket = require('./socket');
const mac = require('../mac');

const ATTEMPTS = 3;

const unicast = [];

const discovery = (multicast) => JSON.stringify({
  id: mac(),
  type: ACTION_DISCOVERY,
  payload: { type: DAEMON, version: VERSION, multicast }
})

const service = socket(
  () => () => {
    const m = discovery(true);
    const u = discovery(false);
    for (var i = 0; i < ATTEMPTS; i++) {
      service.send(m, CLIENT_GROUP);
      unicast.forEach(ip => service.send(u, ip));
    }
  },
  DISCOVERY_INTERVAL, CLIENT_PORT, CLIENT_SERVER_PORT, true, 1
);

service.addUnicast = (ip) => {
  if (unicast.includes(ip)) return;
  unicast.push(ip);
};

service.delUnicast = (ip) => {
  var index = unicast.indexOf(ip);
  if (index === -1) return;
  unicast.splice(index, 1);
};

service.broadcast = (packet) => {
  for (let i = 0; i < ATTEMPTS; i++) {
    service.send(packet, CLIENT_GROUP);
    unicast.forEach(ip => service.send(packet, ip));
  }
}

module.exports = service;