
const apn = require('./apn');
const firebase = require('./firebase');
const { peers } = require('../websocket/peer');
const { get, add } = require('../actions');
const mac = require('../mac');
const { TOKEN } = require('./constants');
const { ac } = require('../drivers');

const tokens = new Map();

const services = new Map([
  ['ios', apn],
  ['android', firebase],
]);

module.exports.addToken = ({token, os}, session) => {
  add(mac(), os, token);
  if (peers.has(session)) {
    const peer = peers.get(session);
    tokens.set(token, peer);
  }
};

module.exports.deleteToken = (session) => {
  for (let [token, peer] of tokens.entries()) {
    if (peer.session === session) {
      tokens.delete(token);
    }
  }
};

const send = (title, message, payload, action) => (service) => (token) => {
  if (tokens.has(token)) {
    console.log('send', token, action)
    tokens.get(token).send(action, (err) => {
      if (err) {
        service.send(token, title, message, payload);
      }
    });
  } else {
    service.send(token, title, message, payload);
  }
};

const getTitle = (id) => {
  const {title, code} = get(id);
  return title || code;
};

const getSender = (action) => {
  const id = mac();
  let {title, message, ...payload} = action;
  title = title || getTitle(id);
  message = message || getTitle(action.id);
  return send(
    title, 
    message, 
    {id, action: JSON.stringify(payload)},
    {title, message, ...payload}
  );
}

module.exports.broadcast = (action) => {
  const sendTo = getSender(action);
  const daemon = get(mac()) || {};
  for(const [os, service] of services.entries()) {
    const pool = daemon[os];
    if (Array.isArray(pool)) {
      pool.forEach(sendTo(service));
    }
  }
};
