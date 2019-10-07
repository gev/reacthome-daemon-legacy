
const sip = require('sip');
const { INVITE, REGISTER } = require('./constants');
const { onRegister, onInvite } = require('./handle');
const options = require('./config')

module.exports.start = () => {
  sip.start({}, (request) => {
    console.log(JSON.stringify(request, null, 2));
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
