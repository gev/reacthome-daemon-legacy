
const { broadcastAction } = require('./webrtc');

const PING = 'ping';
const TIMEOUT = 1000;

module.exports.start = () => {
  setInterval(broadcastAction, TIMEOUT, {
    type: PING
  });
};
