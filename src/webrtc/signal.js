
const { RTCPeerConnection, RTCIceCandidate } = require('wrtc');
const { OFFER, ANSWER, CANDIDATE, CONNECTING, CONNECTED, DISCONNECTED, ACTION, ASSET } = require('./constants');
const { onAction, onAsset } = require('./handle');
const { peers, actions, assets } = require('./peer');
const { options } = require('./config');

const deleteSession = session => {
  const close = (map) => {
    if (map.has(session)) {
      map.get(session).close();
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
        if (peers.has(session) && peers.get(session).iceConnectionState === CONNECTING) return;
        const peer = new RTCPeerConnection(config);
        peers.set(session, peer);
        peer.ondatachannel = ({ channel }) => {
          switch (channel.label) {
            case ACTION: {
              channel.onmessage = onAction(session);
              actions.set(session, channel);
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
          await peer.setRemoteDescription(action.jsep);
          const answer = await peer.createAnswer(options);
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
