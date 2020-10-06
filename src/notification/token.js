
const { add, del } = require('../actions');
const { peers } = require('../websocket/peer');
const mac = require('../mac');
const { TOKEN } = require('./constants');

const tokens = new Map();

module.exports.addToken = ({ token, platform }, session) => {
  add(mac(), TOKEN, {token, platform});
  if (peers.has(session)) {
    tokens.set(token, peers.get(session));
  }
};

module.exports.deleteSession = (session) => {
  for (let [token, peer] of tokens.entries()) {
    if (peer.session === session) {
      tokens.delete(token);
    }
  }
};

module.exports.deleteToken = (token) => {
  del(mac(), TOKEN, token);
  tokens.delete(token);
};

module.exports.tokens = tokens;
