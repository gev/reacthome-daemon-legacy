
const fs = require('fs');
const { ACK, BYE } = require('../sip/constants');
const { START, WATCH } = require('../camera/constants');
const { CANDIDATE } = require('../webrtc/constants');
const { INIT } = require('../init/constants');
const { asset } = require('../constants');
const { run } = require('../controllers/service');
const { onWatch, onStart } = require('../camera');
const { broadcastAsset } = require('./peer');
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

const streams = new Map();

module.exports.onAsset = ({ data }) => {
  const buff = Buffer.from(data);
  const transaction = buff.readBigUInt64LE(0);
  const total = buff.readUInt16LE(8);
  const i = buff.readUInt16LE(10);
  const length = buff.readUInt16LE(12);
  const name = buff.slice(14, 14 + length).toString();
  const chunk = buff.slice(14 + length);
  const file = asset(name);
  fs.exists(file, (exists) => {
    if (!exists) {
      let stream;
      if (i === 1) {
        stream = fs.createWriteStream(file);
        stream.on('error', console.error);
        streams.set(name, steram);
      } else {
        if (streams.has(name)) {
          stream = streams.get(name);
        } else {
          return;
        }
      }
      stream.write(chunk);
      if (i === total) {
        stream.close();
      }
      broadcastAsset(data);
    }
  });
};
