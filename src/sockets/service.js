
const {
  mac,
  version,
  DAEMON,
  DISCOVERY_INTERVAL,
  ACTION_DISCOVERY,
  SERVICE_GROUP,
  SERVICE_PORT,
} = require('../constants');
const socket = require('./socket');

let unicast = [];

const discovery = (multicast) => JSON.stringify({
  id: mac,
  type: ACTION_DISCOVERY,
  payload: { type: DAEMON, version, multicast }
})

const service = socket(
  () => {
    const m = discovery(true);
    const u = discovery(false);
    return () => {
      service.send(m, SERVICE_GROUP);
      unicast.forEach(ip => service.send(u, ip));
    }
  },
  DISCOVERY_INTERVAL, SERVICE_PORT, SERVICE_GROUP
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
  service.send(packet, SERVICE_GROUP);
  unicast.forEach(ip => service.send(packet, ip));
}

module.exports = service;