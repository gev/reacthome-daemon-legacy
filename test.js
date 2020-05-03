const { RTCPeerConnection } = require('wrtc');

setInterval(() => {
// setTimeout(() => {
  // for (let i = 0; i < 1; i++) {
    const peer = new RTCPeerConnection();
    setTimeout(() => {
      peer.close();
      // gc();
    }, 5000);
  // }
}, 10000);
