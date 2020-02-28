
const { RTCPeerConnection, RTCIceCandidate } = require('wrtc');
const { OFFER, ANSWER, CANDIDATE, FAILED, ACTION, ASSET } = require('./constants');
const { onAction, onAsset } = require('./handle');
const { peers, actions, assets } = require('./peer');
const { options } = require('./config');
const list = require('../init/list');

const deleteSession = session => {
  actions.delete(session);
  assets.delete(session);
  peers.delete(session);
};

module.exports = (session, message, send, config) => {
  try {
    const action = JSON.parse(message);
    switch(action.type) {
      case OFFER: {
        const peer = new RTCPeerConnection(config);
        peer.ondatachannel = ({ channel }) => {
          switch (channel.label) {
            case ACTION: {
              channel.onmessage = onAction(session);
              actions.set(session, channel);
              list(session);
              break;
            }
            case ASSET: {
              channel.onmessage = onAsset(session);
              assets.set(session, channel);
              break;
            }
          }
          channel.onerror = () => {
            deleteSession(session);
          };
        };
        peer.onconnectionstatechange = () => {
          if (peer.connectionState === FAILED) {
            deleteSession(session);
          }
        };
          peer.onicecandidate = ({ candidate }) => {
          if (!candidate) return;
          send({ type: CANDIDATE, candidate });
        };
        peer.setRemoteDescription(action.jsep)
          .then(() => peer.createAnswer(options))
          .then(answer => {peer.setLocalDescription(answer)})
          .then(() => {send({ type: ANSWER, jsep: peer.localDescription })})
          .catch(() => {deleteSession(session)});
        if (peers.has(session)) {
          peers.get(session).close();
        }
        actions.delete(session);
        assets.delete(session);
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
