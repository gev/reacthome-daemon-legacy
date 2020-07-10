
const firebase = require('firebase-admin');
const { peers } = require('../websocket/peer');
const { get, add } = require('../actions');
const mac = require('../mac');
const { POOL } = require('../constants');
const { TOKEN, NOTIFY } = require('./constants');

const serviceAccount = require('../../var/firebase.json');

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

const send = (token, action, message) => {
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

const broadcast = (action, message) => {
  const { pool = [] } = get(TOKEN) || {};
  pool.forEach(token => {
    send(token, action, message);
  });
};

const notificationMessage = (action) => {
  const {title, code} = get(mac());
  return {
    title: action.title || title || code,
    body: action.message
  };
};

module.exports.sendNotification = (token, action) => {
  const notification = notificationMessage(action);
  send(token, {type: NOTIFY, notification}, {notification});
};

module.exports.broadcastNotification = (action) => {
  const notification = notificationMessage(action);
  broadcast({type: NOTIFY, notification}, {notification});
};

const inviteMessage = (action) => {
  const {title, code} = get(mac());
  const from = get(action.from);
  return {
    notification: {
      title: title || code,
      body: from.title || from.code
    },
    data: {
      id: mac(),
      action: JSON.stringify(action)
    }
  };
};

module.exports.sendInvite = (token, action) => {
  send(token, action, inviteMessage(action));
};

module.exports.broadcastInvite = (action) => {
  broadcast(action, inviteMessage(action));
};



