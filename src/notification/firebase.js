
const firebase = require('firebase-admin');
const account = require('../../var/firebase.json');

const sound = 'default';

const params = {
  priority: 'high',
  contentAvailable: true,
};

firebase.initializeApp({
  credential: firebase.credential.cert(account),
  databaseURL: 'https://reacthome-9021b.firebaseio.com'
});

module.exports.send = (token, title, body, data) => {
  const message = {
    notification: {title, body, sound},
    data
  }
  firebase.messaging()
    .sendToDevice(token, message, params)
    .catch(console.error);
};
