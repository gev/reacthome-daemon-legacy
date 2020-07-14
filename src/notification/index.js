
const firebase = require('./firebase');
const { peers } = require('../websocket/peer');
const { get, add } = require('../actions');
const mac = require('../mac');
const { TOKEN } = require('./constants');
const { ac } = require('../drivers');

const tokens = new Map();

module.exports.addToken = ({token}, session) => {
  add(mac(), TOKEN, token);
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

const send = (title, message, payload, action) => (token) => {
  if (tokens.has(token)) {
    tokens.get(token).send(action, (err) => {
      if (err) {
        firebase.send(token, title, message, payload);
      }
    });
  } else {
    firebase.send(token, title, message, payload);
  }
};

const getTitle = (id) => {
  const {title, code} = get(id);
  return title || code;
};

module.exports.broadcast = (action) => {
  const id = mac();
  let {title, message, ...payload} = action;
  title = title || getTitle(id);
  message = message || getTitle(action.id);
  const {token} = get(mac()) || [];
  token.forEach(send(
    title, 
    message, 
    {id, action: JSON.stringify(payload)},
    {title, message, ...payload}
  ));
};
