
const apn = require('apn');
const { get } = require('../actions');
const mac = require('../mac');
const {deleteToken} = require ('./token');
const token = require('../../var/apn.json');

provider = new apn.Provider({
  token,
  production: true
});

const payload = (action) => ({
  id: mac(),
  action: JSON.stringify(action),
});

module.exports.notificationMessage = (action) => {
  const {title, code} = get(mac());
  return new apn.Notification({
    title: action.title || title || code,
    body: action.message,
    topic: 'net.reacthome',
    pushType: 'alert',
    payload: payload(action)
  });
};

module.exports.dataMessage = (action) => {
  return new apn.Notification({
    topic: 'net.reacthome',
    payload: payload(action)
  });
};

module.exports.send = (token, message) => {
  provider
    .send(message, token)
    .then(({failed = []}) => {
      console.log(failed);
      failed.forEach(({error, device, failed}) => {
        if (!error) deleteToken(device);
      });
    })
    .catch(console.error);
};
