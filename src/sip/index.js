
const sip = require('sip');
const { INVITE, REGISTER } = require('./constants');
const { onRegister, onInvite } = require('./handle');
const options = require('./config')

module.exports.start = () => {
  sip.start({}, (request) => {
    switch(request.method) {
      console.log(JSON.stringify(request, null, 2));
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
