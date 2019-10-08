
let state = {};

module.exports.init = (s) => state = s;

module.exports.get = (id) => state[id];

module.exports.set = (id, payload) => {
  state[id] = { ...state[id], ...payload };
};

module.exports.state = () => state;

module.exports.list = () =>
  Object.entries(state)
        // .filter(([payload]) => !(payload instanceof Array) &&
        //                         (payload instanceof Object) &&
        //                          payload.timestamp)
        .map(([{ timestamp }, id]) => [id, timestamp]);
