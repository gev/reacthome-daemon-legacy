const apn = require('apn');
const account = require('../../var/apn.json');

const topic = 'net.reacthome';

const provider = new apn.Provider({
  token: account,
  production: false
});

module.exports.send = (token, alert, body, payload) => {
  const note = new apn.Notification({topic, alert, body, payload});
  provider.send(note, token)
    .then(res => console.log(JSON.stringify(res, null, 2)))
    .catch(console.error);
};
