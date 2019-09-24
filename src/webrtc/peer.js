
const peers = new Map();
const assets = new Map();
const actions = new Map();

const send = (channel, message) => {
  if (channel.readyState === 'open') {
    channel.send(message);
  }
}

const sendAction = (session, action) => {
  send(actions.get(session), JSON.stringify(action));
};

const sendAsset = (session, asset) => {
  send(assets.get(session), JSON.stringify);
};

const broadcastAction = (message) => {
  actions.forEach((channel, session) => {
    send(channel, message)
  });
};

const broadcastAsset = (message) => {
  assets.forEach((channel, session) => {
    send(channel, message)
  });
};

module.exports = {
  broadcastAction, broadcastAsset,
  sendAction, sendAsset,
  actions, assets,
  peers
};
