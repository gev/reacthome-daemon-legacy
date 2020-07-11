
const firebase = require('firebase-admin');
const firebaseAccount = require('../../var/firebase.json');

firebase.initializeApp({
  credential: firebase.credential.cert(firebaseAccount),
  databaseURL: 'https://reacthome-9021b.firebaseio.com'
});

const params = {
  priority: 'high',
};

module.exports.send = (token, title, body, data) => {
  const message = {
    notification: {title, body},
    data
  }
  firebase.messaging()
    .sendToDevice(token, message, params)
    .catch(console.error);
};
