
const { broadcastAction } = require('./webrtc/peer');

const PING = 'ping';
const TIMEOUT = 1000;

module.exports = () => {
  setInterval(broadcastAction, TIMEOUT, {
    type: PING
  });
};
