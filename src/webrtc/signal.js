
const { RTCPeerConnection, RTCIceCandidate } = require('wrtc');
const { OFFER, ANSWER, CANDIDATE, CONNECTING, CONNECTED, DISCONNECTED, FAILED, ACTION, ASSET } = require('./constants');
const { onAction, onAsset } = require('./handle');
const { peers, actions, assets } = require('./peer');
const { options } = require('./config');
const list = require('../init/list');

const deleteSession = session => {
  const close = (map) => {
    if (map.has(session)) {
      // map.get(session).close();
      map.delete(session);
    }
  }
  close(actions);
  close(assets);
  close(peers);
  console.warn('Close session', session);
};

module.exports = async (session, message, send, config) => {
  try {
    const action = JSON.parse(message);
    console.log(session, action.type);
    switch(action.type) {
      case OFFER: {
        if (peers.has(session)) {
          const {iceConnectionState} = peers.get(session);
          // if (iceConnectionState === CONNECTING || iceConnectionState === CONNECTED) {
          if (iceConnectionState === CONNECTING) {
              return;
          }
          deleteSession(session);
        }
        const peer = new RTCPeerConnection(config);
        peers.set(session, peer);
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
            console.error(e);
            // deleteSession(session);
          };
        };
        peer.onconnectionstatechange = () => {
          switch (peer.connectionState) {
            case FAILED:
            case DISCONNECTED: {
                deleteSession(session);
              break;
            }
          }
        };
        peer.onicecandidate = ({ candidate }) => {
          if (!candidate) return;
          send({ type: CANDIDATE, candidate });
        };
        try {
          console.log('offer', action.jsep);
          await peer.setRemoteDescription(action.jsep);
          const answer = await peer.createAnswer(options);
          console.log('answer', answer);
          await peer.setLocalDescription(answer);
          send({ type: ANSWER, jsep: peer.localDescription });
        } catch (e) {
          console.error(e);
          // deleteSession(session);
        }
        break;
      }
      case CANDIDATE: {
        if (peers.has(session)) {
          try {
            console.log('candidate', action.candidate);
            await peers.get(session).addIceCandidate(new RTCIceCandidate(action.candidate));
          } catch (e) {
            console.error(e);
            // deleteSession(session);
          }
        }
        break;
      }
    }
  } catch (e) {
    console.error(e);
  }
};
