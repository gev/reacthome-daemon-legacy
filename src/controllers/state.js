const db = require("../db");

let state = new Map;

module.exports.get = (id) => state.get(id);

module.exports.has = (id) => state.has(id);

module.exports.set = (id, payload) => {
  if (state.has(id)) {
    Object.assign(state.get(id), payload);
  } else {
    state.set(id, payload);
  }
};


module.exports.list = () =>
  state.entries()
    .filter(
      ([id, payload]) =>
        !(payload instanceof Array) &&
        payload instanceof Object &&
        payload.timestamp
    )
    .map(([id, { timestamp }]) => [id, timestamp]);

module.exports.assets = () =>
  Array.from(state.values()).reduce((assets, { image }) => {
    if (image && !assets.includes(image)) {
      assets.push(image);
    }
    return assets;
  }, []);
