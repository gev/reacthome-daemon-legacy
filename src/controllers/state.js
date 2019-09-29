
let state = {};

module.exports.init = (s) => state = s;

module.exports.get = (id) => state[id];

module.exports.set = (id, payload) => {
  state[id] = { ...state[id], ...payload, timestamp: Date.now() };
};

module.exports.state = () => state;
