
const firebase = require('firebase-admin');
const { broadcastAction } = require('../webrtc/peer');

const serviceAccount = require('../../var/firebase.json');

firebase.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://reacthome-9021b.firebaseio.com'
});

const tokens = new Set();

module.exports.tokens = tokens;

module.export.notify = ({ title, message }) => {
  tokens.forEach(token => {
    firebase.messaging()
      .sendToDevice(token, { notification: { title, body: message } })
      .catch(console.errorup);
  });
  broadcastAction(action);
};

