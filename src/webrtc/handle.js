
const { ACK, BYE } = require('../sip/constants');
const { START, WATCH } = require('../camera/constants');
const { CANDIDATE } = require('../webrtc/constants');
const { INIT } = require('../init/constants');
const { run } = require('../controllers/service');
const { onWatch, onStart } = require('../camera');
const onAck = require('../sip/ack');
const onBye = require('../sip/bye');
const onInit = require('../init')
const janus = require('../janus');

module.exports.onAction = (session) => ({ data }) => {
  try {
    const action = JSON.parse(Buffer.from(data));
    switch (action.type) {
      case INIT: {
        onInit(action, session);
        break;
      }
      case ACK: {
        onAck(action);
        break;
      }
      case BYE: {
        onBye(action);
        break;
      }
      case WATCH: {
        onWatch(action, session);
        break;
      }
      case START: {
        onStart(action);
        break;
      }
      case CANDIDATE: {
        janus.trickle(action);
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

const TIMEOUT = 10000;

module.exports.onAsset = ({ data }) => {
  const buff = Buffer.from(data);
  const transaction = buff.readBigUInt64LE(0);
  const total = buff.readUInt16LE(8);
  const i = buff.readUInt16LE(10);
  const length = buff.readUInt16LE(12);
  const name = buff.slice(14, 14 + length).toString();
  const chunk = buff.slice(14 + length);
  console.log(transaction, total, i, name, chunk.length);
};
