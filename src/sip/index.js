
const sip = require('sip');
const { INVITE, REGISTER } = require('./constants');
const { onRegister, onInvite } = require('./handle');
const options = require('./config')

module.exports.start = () => {
  sip.start(options, (request, info) => {
    console.log(request);
    switch(request.method) {
      case REGISTER: {
        onRegister(request);
        break;
      }
      case INVITE: {
        onInvite(request);
        break;
      }
    }
  });
};
