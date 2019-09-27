
const peers = new Map();
const assets = new Map();
const actions = new Map();

const sendMessage = (channel, message) => {
  console.log(channel.readyState, message);
  if (channel.readyState === 'open') {
    channel.send(message);
  }
}

const send = (channels, handle) => (session, data) => {
  handle(channels.get(session), data);
}

const broadcast = (channels, handle) => (data) => {
  for (let channel of channels.values()) {
    handle(channel, data);
  }
}

const sendAction = (channel, action) => {
  sendMessage(channel, JSON.stringify(action));
}

const sendAsset = (channel, asset) => {
  //TODO
};

module.exports.peers = peers;
module.exports.assets = assets;
module.exports.actions = actions;

module.exports.sendAction = send(actions, sendAction);
module.exports.broadcastAction = broadcast(actions, sendAction);

module.exports.sendAsset = send(assets, sendAsset);
module.exports.broadcastAsset = broadcast(assets, sendAsset);
