
const peers = new Map();

const TIMEOUT  = 20000;
const INTERVAL = 10000;

setInterval(() => {
  for (const peer of peers.values()) {
    if (!peer.online) return;
    const dt = Date.now() - peer.timestamp;
    if (dt > TIMEOUT) {
      peer.online = false;
    }
  }
}, INTERVAL);

module.exports.peers = peers;

module.exports.send = (session, message) => {
  if (peers.has(session)) {
    peers.get(session).send(message);
  }
};

module.exports.broadcast = (message, ignore) => {
  for (const [session, peer] of peers.entries()) {
    if (session !== ignore) {
      peer.send(message);
    }
  }
};
