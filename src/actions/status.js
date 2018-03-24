
const set = require('./create');
const { updateFirmware } = require('./firmware');
const { DEVICE, DISCOVERY_INTERVAL } = require('../constants');

const timeout = {};

const offline = (id) => (dispatch) => {
  dispatch(set(DEVICE, id, { online: false, ready: false }));
};

const online = (id, type, version, ip, ready) => (dispatch, getState) => {
  clearTimeout(timeout[id]);
  dispatch(set(DEVICE, id, {
    type, version, ip, online: true, ready
  }));
  const device = getState()[DEVICE][id];
  if (device.pending) dispatch(updateFirmware(id));
  timeout[id] = setTimeout(() => {
    dispatch(offline(id));
    delete timeout[id];
  }, 2 * DISCOVERY_INTERVAL);
};

module.exports = { offline, online };
