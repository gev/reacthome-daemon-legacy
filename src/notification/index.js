
const firebase = require('firebase-admin');
const { peers } = require('../websocket/peer');
const { get, add } = require('../actions');
const mac = require('../mac');
const { POOL } = require('../constants');
const { TOKEN, NOTIFY } = require('./constants');

const tokens = new Map();

const serviceAccount = require('../../var/firebase.json');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://reacthome-9021b.firebaseio.com'
});

module.exports.addToken = ({ token }, session) => {
  add(TOKEN, POOL, token);
  if (peers.has(session)) {
    tokens.set(token, peers.get(session));
  }
};

module.exports.deleteToken = (token) => {
  tokens.delete(token);
};

module.exports.deleteTokenByPeer = (peer) => {
  for (const [key, value] in tokens.entries()) {
    if (value === peer) {
      tokens.delete(key);
    }
  }
};

const params = {
  priority: 'high',
  contentAvailable: true,
};

const send = (token, message) => {
  firebase.messaging()
    .sendToDevice(token, message, params)
    .catch(console.error);
};

const broadcast = (action, message) => {
  const { pool = [] } = get(TOKEN) || {};
  pool.forEach(token => {
    if (tokens.has(token)) {
      tokens.get(token).send(action, (err) => {
        if (err) {
          send(token, message);
        }
      });
    } else {
      send(token, message);
    }
  });
};

module.exports.notify = (action) => {
  const {title, code} = get(mac());
  const notification = {
    title: action.title || title || code,
    body: action.message
  };
  broadcast({type: NOTIFY, notification}, {notification});
};

module.exports.broadcast = (data) => {
  broadcast(data, {data});
};

