
const { get } = require('../actions');
const mac = require('../mac');
const service = require(service);

const send = (action, message) => (token) => {
  if (tokens.has(token)) {
    const peer = tokens.get(token);
    if (peer.state === 'active') {
      peer.send(action, (err) => {
        if (err) {
          service.send(token, message(action));
        }
      });
    } else {
      service.send(token, message(action));
    }
  } else {
    service.send(token, message(action));
  }
}

const broadcast = (message) => (action) => {
  const { token = [] } = get(mac()) || {};
  token.forEach(send(action, message));
};

module.exports.broadcastNotification = broadcast(service.notificationMessage);
module.exports.broadcastAction = broadcast(service.dataMessage);
