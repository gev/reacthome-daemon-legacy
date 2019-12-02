
const firebase = require('firebase-admin');
const { broadcastAction } = require('../webrtc/peer');
const { get } = require('../actions');
const { TOKEN } = require('./constants');

const serviceAccount = require('../../var/firebase.json');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://reacthome-9021b.firebaseio.com'
});

module.exports.notify = ({ title, message }) => {
  const { pool = [] } = get(TOKEN) || {};
  pool.forEach(token => {
    firebase.messaging()
      .sendToDevice(token, { notification: { title, body: message } })
      .catch(console.errorup);
  });
  // broadcastAction(action);
};

