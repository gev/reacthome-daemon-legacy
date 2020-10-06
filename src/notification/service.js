const firebase = require('./firebase');
const apn = require('./apn');
const { ANDROID } = require('./constants');
const { deleteToken } = require('./token');

const send = (service, token, message) => {
  service.send(token, message(service));
}

module.exports.send = ({token, platform}, message) => {
  switch (platform) {
    case ANDROID:
      send(firebase, token, message);
      break;
    case IOS:
      send(ios, token, message);
      break;
    default: 
      deleteToken(token);
  }
};

module.exports.notificationMessage = (action) => ({notificationMessage}) => notificationMessage(action);
module.exports.dataMessage = (action) => ({dadaMessage}) => dadaMessage(action);
