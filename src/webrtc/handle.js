
const fs = require('fs');
const { GET } = require('../init/constants');
const { ACK, BYE } = require('../sip/constants');
const { START, WATCH } = require('../camera/constants');
const { CANDIDATE } = require('./constants');
const { asset } = require('../constants');
const { run } = require('../controllers/service');
const { onWatch, onStart } = require('../camera');
const { broadcastAsset } = require('./peer');
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

module.exports.onAsset = ({ data }) => {
  const buff = Buffer.from(data);
  const transaction = buff.readBigUInt64LE(0);
  const total = buff.readUInt16LE(8);
  const i = buff.readUInt16LE(10);
  const length = buff.readUInt16LE(12);
  const name = buff.slice(14, 14 + length).toString();
  const chunk = buff.slice(14 + length);
  const tmp = asset(`${transaction}-${name}`);
  fs.appendFile(tmp, chunk, (appendErr) => {
    if (appendErr) {
      console.error(appendErr);
    }
    if (i === total) {
      const file = asset(name);
      fs.exists(file, (exists) => {
        if (exists) {
          fs.unlink(file, (unlinkFileErr) => {
            if (unlinkFileErr) {
              console.error(unlinkFileErr);
              unlink(tmp, (unlinkTmpErr) => {
                if (unlinkTmpErr) {
                  console.error(unlinkTmpErr);
                }
              });
            } else {
              fs.rename(tmp, file, (renameErr) => {
                if (renameErr) {
                  console.error(renameErr);
                }
              })
            }
          });
        }
      });
    }
  });
};
