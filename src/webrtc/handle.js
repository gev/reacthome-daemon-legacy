
const { GET } = require('../init/constants');
const { ACK, BYE } = require('../sip/constants');
const { START, WATCH } = require('../camera/constants');
const { CANDIDATE } = require('./constants');
const { tmp, asset, appendFile, exists, rename, unlink } = require('../fs');
const { run } = require('../controllers/service');
const { onWatch, onStart } = require('../camera');
const { broadcastAsset, broadcastAction } = require('./peer');
const onGet = require('../init/get');
const onAck = require('../sip/ack');
const onBye = require('../sip/bye');
const janus = require('../janus');

module.exports.onAction = (session) => ({ data }) => {
  try {
    const action = JSON.parse(Buffer.from(data));
    switch (action.type) {
      case GET: {
        onGet(action, session);
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
      case 'navigate': {
        broadcastAction(action);
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

module.exports.onAsset = (session) => async ({ data }) => {
  const buff = Buffer.from(data);
  const transaction = buff.readUInt16LE(0);
  const total = buff.readUInt16LE(2);
  const current = buff.readUInt16LE(4);
  const length = buff.readUInt16LE(6);
  const name = buff.slice(8, 8 + length).toString();
  const chunk = buff.slice(8 + length);
  const temp = tmp(`${session}-${transaction}-${name}`);
  // broadcastAsset(data);
  try {
    await appendFile(temp, chunk)
    if (current === total) {
      const file = asset(name);
      if (await exists(file)) {
        await unlink(file)
      }
      rename(temp, file);
    }
  } catch (e) {
    console.error(e);
  }
};
