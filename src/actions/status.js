
const { set, add } = require('./create');
const { initialize } = require('./init');
const { updateFirmware } = require('./firmware');
const { mac, DEVICE, DISCOVERY_INTERVAL } = require('../constants');

const timeout = {};

const offline = (id) => (dispatch) => {
  dispatch(set(id, { online: false, ready: false, initialized: false }));
};

const online = (id, type, version, ip, ready) => (dispatch, getState) => {
  clearTimeout(timeout[id]);
  dispatch(set(id, {
    type, version, ip, online: true, ready
  }));
  dispatch(add(mac, DEVICE, id));
  const device = getState()[id];
  if (!device.initialized) dispatch(initialize(id));
  if (device.pending) dispatch(updateFirmware(id));
  timeout[id] = setTimeout(() => {
    dispatch(offline(id));
    delete timeout[id];
  }, 2 * DISCOVERY_INTERVAL);
};

module.exports = { offline, online };
