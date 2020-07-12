const apn = require('apn');
const account = require('../../var/apn.json');

const topic = 'net.reacthome';
const sound = 'default'

const provider = new apn.Provider({
  token: account,
  production: false
});

module.exports.send = (token, title, body, payload) => {
  const note = new apn.Notification({
    topic, title, body, sound,
    payload: {...payload, 'content-available': 1}
  });
  provider.send(note, token)
    .catch(console.error);
};
