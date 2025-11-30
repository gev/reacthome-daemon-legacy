

const { get, set } = require('../../actions');
const { HYGROSTAT, DRIVER_TYPE_DAUERHAFT } = require('../../constants');

const timers = new Map();

const sync = (id, i) => {
  const ch = `${id}/proxy/${i}`;
  const proxy = get(ch) || {};
  if (!proxy.proxy || !proxy.bind) return;
  const source = get(proxy.bind) || {};
  const target = get(proxy.proxy) || {};
  switch (target.type) {
    case HYGROSTAT:
      syncHygrostat(ch, proxy, source, target);
      break;
    default:
      const segments = proxy.proxy.split('/');
      const dev = get(segments[0]) || {};
      switch (dev.type) {
        case DRIVER_TYPE_DAUERHAFT:
          syncCurtains(ch, proxy, source, target);
          break;
      }
  }
}

const syncHygrostat = (ch, proxy, source, target) => {
  if (source.timestamp > target.timestamp) {
    if (!source.last) return;
    const value = source.last.value;
    set(ch, { value })
    set(proxy.proxy, { setpoint: value / 2.55 })
  } else {
    const value = target.setpoint * 2.55;
    set(ch, { value })
  }
}

const syncCurtains = (ch, proxy, source, target) => {
  if (source.timestamp > target.timestamp) {
    if (!source.last) return;
    const value = source.last.value;
    set(ch, { value })
    set(proxy.proxy, { position: value })
  } else {
    const value = target.value;
    set(ch, { value })
  }
}

const loop = (id) => () => {
  const driver = get(id) || {};
  for (let i = 0; i < driver.numberProxy; i++) {
    sync(id, i + 1);
  }
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
  timers.set(id, setInterval(loop(id), 300));
};
