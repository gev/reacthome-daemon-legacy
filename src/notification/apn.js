const apn = require('apn');
const apnAccount = require('../../var/apn.json');

const tokens = new Map();

const provider = new apn.Provider({
  token: apnAccount,
  production: false
});

module.exports.send = (token, alert, topic, payload) => {
  const note = new apn.Notification();
  note.alert = alert;
  note.topic = topic;
  note.payload = payload;
  provider.send(note, token)
    .then(res => console.log(JSON.stringify(res, null, 2)))
    .catch(console.error);
};
