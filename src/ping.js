
const { broadcastAction } = require('./webrtc/peer');
const { DISCOVERY_INTERVAL } = require('./constants');

const PING = 'ping';

module.exports = () => {
  setInterval(broadcastAction, DISCOVERY_INTERVAL, {
    type: PING
  });
};
