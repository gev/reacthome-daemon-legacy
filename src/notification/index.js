
const apn = require('./apn');
const firebase = require('./firebase');
const { peers } = require('../websocket/peer');
const { get, set } = require('../actions');
const mac = require('../mac');
const { TOKEN } = require('./constants');

set(TOKEN, {pool:{}});

const tokens = new Map();

const service = new Map([
  ['ios', apn],
  ['android', firebase],
]);

module.exports.addToken = ({token, os}, session) => {
  set(TOKEN, {[token]: os});
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

const getTitle = (id) => {
  const {title, code} = get(id);
  return title || code;
};

const push = (token, os, action) => {
  if (service.has(os)) {
    const id = mac();
    service.get(os).push(
      token,
      action.title || getTitle(id), 
      action.body || getTitle(action.id),
      {id, action: JSON.stringify(action)}
    );
  }
};

const send = (token, os, action) => {
  if (tokens.has(token)) {
    tokens.get(token).send(action, (err) => {
      if (err) {
        push(token, os, action);
      }
    });
  } else {
    push(token, os, action);
  }
}

module.exports.broadcast = (action) => {
  const pool = get(TOKEN) || {};
  Object.entries(pool).forEach(([token, os]) => {
    send(token, os, action);
  });
};
