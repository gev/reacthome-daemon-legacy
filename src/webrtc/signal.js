
const { RTCPeerConnection, RTCIceCandidate } = require('wrtc');
const { OFFER, ANSWER, CANDIDATE, FAILED } = require('./const');
const { peers, channels } = require('./peer');
const { options } = require('./config');

module.exports = (handle) => (session, message, send, config) => {
  try {
    const action = JSON.parse(message);
    switch(action.type) {
      case OFFER: {
        const peer = new RTCPeerConnection(config);
        peer.ondatachannel = ({ channel }) => {
          channel.onmessage = ({ data }) => handle(session, data);
          channel.onerror = console.error;
          channels.set(session, channel);
        };
        peer.onconnectionstatechange = () => {
          if (peer.connectionState === FAILED) {
            channels.delete(session);
            peers.delete(session);
          }
        };
          peer.onicecandidate = ({ candidate }) => {
          if (!candidate) return;
          send({ type: CANDIDATE, candidate });
        };
        peer.setRemoteDescription(action.jsep)
          .then(() => peer.createAnswer(options))
          .then(answer => {peer.setLocalDescription(answer)})
          .then(() =>
            send({ type: ANSWER, jsep: peer.localDescription }))
          .catch(console.error);
        peers.set(session, peer);
        break;
      }
      case CANDIDATE: {
        if (peers.has(session)) {
          const peer = peers.get(session);
          peer.addIceCandidate(new RTCIceCandidate(action.candidate))
            .catch(console.error);
        }
        break;
      }
    }
  } catch (e) {
    console.error(e);
  }
};
