

const { RTCPeerConnection, RTCIceCandidate } = require('wrtc');
const {ICE, options} = require('./src/webrtc/config');


setInterval(() => {
  const peer = new RTCPeerConnection(ICE);
  setTimeout(() => {
    peer.close();
  }, 5000);
}, 10000);
