const { RTCPeerConnection } = require('wrtc');

setInterval(() => {
// setTimeout(() => {
  // for (let i = 0; i < 1; i++) {
    const peer = new RTCPeerConnection();
    setTimeout(() => {
      peer.close();
      peer = null;
      // gc();
    }, 3000);
  // }
}, 5000);
