
const peers = new Map();
const channels = new Map();

const _send = (channel, message) => {
  channel.send(message);
}

const send = (session, message) => {
  console.log(session, message);
  _send(channels.get(session), message);
};

const broadcast = (message) => {
  channels.forEach((channel, session) => {
    _send(channel, message)
  });
};

module.exports = { peers, channels, send, broadcast };
