const { RTCPeerConnection } = require('wrtc');

setInterval(() => {
  const peer = new RTCPeerConnection();
  setTimeout(() => {
    // peer.close();
  }, 500);
}, 1000);
