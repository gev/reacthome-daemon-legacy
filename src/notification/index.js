
const firebase = require('firebase-admin');
const { peers } = require('../websocket/peer');
const { get, add } = require('../actions');
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

module.exports.notify = (action) => {
  const { pool = [] } = get(TOKEN) || {};
  const notification = { title: action.title, body: action.message };
  const data = {};
  pool.forEach(token => {
    if (tokens.has(token)) {
      tokens.get(token).send({ type: NOTIFY, notification, data }, (err) => {
        if (err) {
          send(token, { notification, data });
        }
      });
    } else {
      send(token, { notification, data });
    }
  });
};
