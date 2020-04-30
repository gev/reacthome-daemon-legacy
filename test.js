const { RTCPeerConnection } = require('wrtc');

setInterval(() => {
  const peer = new RTCPeerConnection();
  setTimeout(() => {
    // peer.close();
  }, 5000);
}, 10000);
