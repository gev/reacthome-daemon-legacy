const { get, set } = require("../../../actions");
const { TIMEOUT } = require("./constants");

const instance = new Set();

const sync = (id) => {
  const dev = get(id) || {};
};

module.exports.run = (action) => {
  const { id, type } = action;
};

module.exports.handle = (action) => {
  const { id, data } = action;
};

module.exports.clear = () => {
  instance.clear();
};

module.exports.add = (id) => {
  instance.add(id);
};

let index = 0;

setInterval(() => {
  const arr = Array.from(instance);
  if (arr.length > 0) {
    sync(arr[index % arr.length]);
    index++;
  }
}, TIMEOUT);
