
const sip = require('sip');
const { INVITE, REGISTER, CANCEL, BYE } = require('./constants');
const { onRegister, onInvite } = require('./handle');
const options = require('./config')

module.exports.start = () => {
  sip.start({}, (request) => {
    switch(request.method) {
      case REGISTER: {
        onRegister(request);
        break;
      }
      case INVITE: {
        onInvite(request);
        break;
      }
      case CANCEL: {
        onCancel(request);
        break;
      }
      case BYE: {
        onBye(request);
        break;
      }
    }
  });
};
