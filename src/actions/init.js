
const {
  mac,
  DO,
  DI,
  DIM,
  ACTION_INITIALIZE,
  DEVICE,
  DEVICE_PORT,
  DEVICE_TYPE_DO8,
  DEVICE_TYPE_DO12,
  DEVICE_TYPE_DIM4,
  DEVICE_TYPE_DIM8,
  DEVICE_TYPE_PLC,
  DISCOVERY_INTERVAL
} = require('../constants');
const { set, add } = require('./create');
const { device } = require('../sockets');

module.exports.initialized = (id) => (dispatch, getState) => {
  dispatch(set(id, { initialized: true }));
}

module.exports.initialize = (id, data) => (dispatch, getState) => {
  dispatch(add(mac, DEVICE, id));
  dispatch(set(id, { initialized: false }));
  const dev = getState()[id];
  const a = [ACTION_INITIALIZE];
  switch (dev.type) {
    case DEVICE_TYPE_DO8: {
      for (let i = 1; i <= 8; i++) {
        const channel = getState()[`${id}/${DO}/${i}`]; 
        a[i] = (channel && channel.value) || 0;
      }
      break;
    }
    case DEVICE_TYPE_DO12: {
      for (let i = 1; i <= 12; i++) {
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
    case DEVICE_TYPE_DIM8: {
      for (let i = 1; i <= 8; i++) {
        const channel = getState()[`${id}/${DIM}/${i}`]; 
        a[2 * i - 1] = (channel && channel.type) || 0;
        a[2 * i] = (channel && channel.value) || 0;
      }
      break;
    }
    case DEVICE_TYPE_PLC: {
      for (let i = 1; i <= 36; i++) {
        const channel = getState()[`${id}/${DI}/${i}`]; 
        a[i] = (channel && channel.value) || 0;
      }
      for (let i = 1; i <= 24; i++) {
        const channel = getState()[`${id}/${DO}/${i}`]; 
        a[i + 36] = (channel && channel.value) || 0;
      }
      break;
    }
    default:
      dispatch(set(id, { initialized: true }));
      return;
  }
  device.sendConfirm(Buffer.from(a), dev.ip, () => {
    const d = getState()[id];
    return d && d.initialized;
  }, 4 * DISCOVERY_INTERVAL);
};
