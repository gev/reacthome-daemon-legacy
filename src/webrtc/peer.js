
const peers = new Map();
const channels = new Map();

const send = (session, message) => {
  channels.get(session).send(message);
};

const broadcast = (message) => {
  console.log(message);
  for (let channel of channels.values()) {
    channel.send(message);
  }
};

module.exports = { peers, channels, send, broadcast };
