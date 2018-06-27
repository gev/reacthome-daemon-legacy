
const {
  DO,
  DIM,
  ACTION_INITIALIZE,
  DEVICE_PORT,
  DEVICE_TYPE_DO8,
  DEVICE_TYPE_DIM4,
  DEVICE_TYPE_PLC,
  DISCOVERY_INTERVAL
} = require('../constants');
const { set } = require('./create');
const { device } = require('../sockets');

module.exports.initialized = (id) => (dispatch, getState) => {
  dispatch(set(id, { initialized: true }));
}

module.exports.initialize = (id) => (dispatch, getState) => {
  dispatch(set(id, { initialized: false }));
  const dev = getState()[id];
  if (!dev) return;
  const a = [ACTION_INITIALIZE];
  switch (dev.type) {
    case DEVICE_TYPE_DO8: {
      for (let i = 1; i <= 8; i++) {
        const channel = getState()[`${id}/${DO}/${i}`]; 
        a[i] = (channel && channel.value) || 0;
      }
      break;
    }
    case DEVICE_TYPE_DIM4: {
      for (let i = 1; i <= 4; i++) {
        const channel = getState()[`${id}/${DIM}/${i}`]; 
        a[2 * i - 1] = (channel && channel.type) || 0;
        a[2 * i] = (channel && channel.value) || 0;
      }
      break;
    }
    case DEVICE_TYPE_PLC: {
      for (let i = 1; i <= 24; i++) {
        const channel = getState()[`${id}/${DO}/${i}`]; 
        a[i] = (channel && channel.value) || 0;
      }
      break;
    }
    default: return;
  }
  device.sendConfirm(Buffer.from(a), dev.ip, () => {
    const d = getState()[id];
    return d && d.initialized;
  }, 2 * DISCOVERY_INTERVAL);
};
