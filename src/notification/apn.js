const apn = require('apn');
const account = require('../../var/apn.json');

const contentAvailable = 1;
const topic = 'net.reacthome';
const sound = 'default'

const provider = new apn.Provider({
  token: account,
  production: false
});

module.exports.send = (token, title, body, payload) => {
  const message = new apn.Notification({
    topic, title, body, sound, payload, contentAvailable
  });
  console.log(message);
  provider.send(message, token)
    .catch(console.error);
};
