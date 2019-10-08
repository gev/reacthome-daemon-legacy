
const { GET } = require('../init/constants');
const { ACK, BYE } = require('../sip/constants');
const { START, WATCH } = require('../camera/constants');
const { CANDIDATE } = require('./constants');
const { tmp, asset, appendFile, exists, rename, unlink } = require('../assets/util');
const { run } = require('../controllers/service');
const { onWatch, onStart } = require('../camera');
const { broadcastAsset } = require('./peer');
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
      default: {
        run(action);
      }
    }
  } catch(e) {
    console.error(e);
  }
};

module.exports.onAsset = async ({ data }) => {
  const buff = Buffer.from(data);
  const transaction = buff.readBigUInt64LE(0);
  const total = buff.readUInt16LE(8);
  const current = buff.readUInt16LE(10);
  const length = buff.readUInt16LE(12);
  const name = buff.slice(14, 14 + length).toString();
  const chunk = buff.slice(14 + length);
  const temp = tmp(`${transaction}-${name}`);
  broadcastAsset(data);
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
