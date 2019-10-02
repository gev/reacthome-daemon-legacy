
const { ACK } = require('../sip/constants');
const { CANDIDATE } = require('../webrtc/constants');
const { INIT } = require('../init/constants');
const { run } = require('../controllers/service');
const onAck = require('../sip/ack');
const onInit = require('../init')
const onCandidate = require('../janus/candidate');

module.exports.onAction = (session) => ({ data }) => {
  try {
    const action = JSON.parse(Buffer.from(data));
    switch (action.type) {
      case INIT: {
        onInit(action, session);
        break;
      }
      case ACK: {
        onAck(action)
        break;
      }
      case CANDIDATE: {
        onCandidate(action)
        break;
      }
      default: {
        run(action);
      }
    }
  } catch(e) {
    console.error(e);
  }
};

module.exports.onAsset = ({ data }) => {
};
