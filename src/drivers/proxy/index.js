

const { get, set } = require('../../actions');

const timers = new Map();

const loop = (id) => () => {
  proxy = get(id);
  console.log('Proxy driver loop', id, proxy);
}


module.exports.run = (action) => {
  console.log('Run', action);
}

module.exports.handle = (action) => {
  console.log('Handle', action);
}


module.exports.clear = () => {
  for (const i of timers.values()) {
    clearInterval(i);
  }
  timers.clear();
}

module.exports.add = (id) => {
  if (timers.has(id)) {
    clearInterval(timers.get(id))
  }
  timers.set(id, setInterval(loop(id), 5000));
};
