
const firebase = require('firebase-admin');
const { peers } = require('../websocket/peer');
const { get, add } = require('../actions');
const mac = require('../mac');
const { POOL } = require('../constants');
const { TOKEN, NOTIFY } = require('./constants');

const serviceAccount = require('../../var/firebase.json');

const sound = 'default';

const tokens = new Map();

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

module.exports.deleteTokenBySession = (session) => {
  for (let [token, peer] of tokens.entries()) {
    if (peer.session === session) {
      tokens.delete(token);
    }
  }
};

const params = {
  priority: 'high',
  contentAvailable: true,
};

const push = (token, message) => {
  firebase.messaging()
    .sendToDevice(token, message, params)
    .catch(console.error);
};

const send = (action, message) => (token) => {
  if (tokens.has(token)) {
    tokens.get(token).send(action, (err) => {
      if (err) {
        push(token, message);
      }
    });
  } else {
    push(token, message);
  }
}

const notification = (action) => {
  const {title, code} = get(mac());
  return {
    title: action.title || title || code,
    body: action.message,
    sound,
  };
};

const data = (action) => ({
  id: mac(),
  action: JSON.stringify(action),
});

const 

const notificationMessage = (action) => ({
  notification: notification(action),
  data: data(action),
})

const dataMessage = (action) => ({
  data: data(action),
});

const broadcast = (action, message) => {
  const { token = [] } = get(mac()) || {};
  token.forEach(send(action, message));
};

module.exports.broadcastNotification = (action) => {
  broadcast(action, notificationMessage(action));
};

module.exports.broadcastAction = (action) => {
  broadcast(action, dataMessage(action));
};
