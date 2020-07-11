const apn = require('apn');
const apnAccount = require('../../var/apn.json');

const tokens = new Map();

const provider = new apn.Provider({
  token: apnAccount,
  production: false
});

module.exports.push = (token, alert, topic, payload) => {
  console.log('apn', token, alert, topic, payload);
  const note = new apn.Notification();
  note.alert = alert;
  note.topic = topic;
  note.payload = payload;
  provider.send(note, token)
    .catch(console.error);
};
