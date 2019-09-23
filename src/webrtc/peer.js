
const peers = new Map();
const channels = new Map();

const send = (session, message) => {
  channels.get(session).send(message);
};

const broadcast = (message) => {
  channels.forEach(([session, channel]) => {
    console.log(session, message);
    channel.send(message);
  });
};

module.exports = { peers, channels, send, broadcast };
