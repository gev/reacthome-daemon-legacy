
const peers = new Map();
const channels = new Map();

const send = (session, message) => {
  console.log(session, message);
  channels.get(session).send(message);
};

const broadcast = (message) => {
  channels.forEach((channel, session) => {
    channel.send(message);
  });
};

module.exports = { peers, channels, send, broadcast };
