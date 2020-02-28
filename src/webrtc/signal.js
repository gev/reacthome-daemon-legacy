
const { RTCPeerConnection, RTCIceCandidate } = require('wrtc');
const { OFFER, ANSWER, CANDIDATE, FAILED, ACTION, ASSET } = require('./constants');
const { onAction, onAsset } = require('./handle');
const { peers, actions, assets } = require('./peer');
const { options } = require('./config');
const list = require('../init/list');

const deleteSession = session => {
  if (peers.has(session)) {
    peers.get(session).close();
  }
  actions.delete(session);
  assets.delete(session);
  peers.delete(session);
};

module.exports = (session, message, send, config) => {
  try {
    const action = JSON.parse(message);
    switch(action.type) {
      case OFFER: {
        deleteSession(session);
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
        try {
          await peer.setRemoteDescription(action.jsep);
          const answer = await peer.createAnswer(options);
          await peer.setLocalDescription(answer);
          send({ type: ANSWER, jsep: peer.localDescription });
          peers.set(session, peer);
        } catch (e) {
          deleteSession(session);
        }
        break;
      }
      case CANDIDATE: {
        if (peers.has(session)) {
          const peer = peers.get(session);
          if (peer.connectionState === CLOSED) {
            deleteSession(session);
          } else {
            peer.addIceCandidate(new RTCIceCandidate(action.candidate))
              .catch(console.error);
          }
        }
        break;
      }
    }
  } catch (e) {
    console.error(e);
  }
};
