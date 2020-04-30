const { RTCPeerConnection } = require('wrtc');

setInterval(() => {
  const peer = new RTCPeerConnection();
  // setTimeout(() => {
    // peer.close();
  // }, 1000);
}, 1000);
