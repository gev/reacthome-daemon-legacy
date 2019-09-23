
const peers = new Map();
const channels = new Map();

const send = (session, message) => {
  channels.get(session).send(message);
};

const broadcast = (message) => {
  channels.values().forEach(channel => {
    channel.send(message)
  })
};

module.exports = { peers, channels, send, broadcast };
