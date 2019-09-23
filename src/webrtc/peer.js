
const peers = new Map();
const channels = new Map();

const send = (session, message) => {
  channels.get(session).send(message);
};

const broadcast = (message) => {
  console.log(channels);
  console.log(channels.values());
  for (let channel of channels.values()) {
    console.log(message);
    channel.send(message);
  }
};

module.exports = { peers, channels, send, broadcast };
