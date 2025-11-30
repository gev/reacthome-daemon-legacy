

const { get, set } = require('../../actions');

const timers = new Map();

const loop = (id) => () => {
  proxy = get(id) || {};
  source = get(proxy.bind) || {};
  target = get(proxy.proxy) || {};
  console.log('Proxy driver loop', id, proxy);
  console.log('Bind', source);
  console.log('Proxy', target);
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
