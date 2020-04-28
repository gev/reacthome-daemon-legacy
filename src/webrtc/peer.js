
const peers = new Map();
const assets = new Map();
const actions = new Map();

setInterval(() => {
  console.log('peers', peers);
  console.log('assets', assets);
  console.log('actions', actions);
}, 10000);

const sendMessage = (channel, data) => {
  try {
    channel.send(data);
  } catch (e) {
    console.error(e);
  }
}

const send = (channels, handle) => (session, data) => {
  if (channels.has(session)) {
    handle(channels.get(session), data);
  }
}

const broadcast = (channels, handle) => (data, ignore) => {
  for (let [session, channel] of channels.entries()) {
    if (session !== ignore) {
      handle(channel, data);
    }
  }
}

const sendAction = (channel, action) => {
  sendMessage(channel, JSON.stringify(action));
}

const sendAsset = (channel, chunk) => {
  sendMessage(channel, chunk);
};

module.exports.peers = peers;
module.exports.assets = assets;
module.exports.actions = actions;

module.exports.sendAction = send(actions, sendAction);
module.exports.broadcastAction = broadcast(actions, sendAction);

module.exports.sendAsset = send(assets, sendAsset);
module.exports.broadcastAsset = broadcast(assets, sendAsset);
