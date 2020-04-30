const { RTCPeerConnection } = require('wrtc');

// setInterval(() => {
setTimeout(() => {
  for (let i = 0; i < 1; i++) {
    const peer = new RTCPeerConnection();
    setTimeout(() => {
      peer.close();
    }, 1000);
  }
}, 10000);
