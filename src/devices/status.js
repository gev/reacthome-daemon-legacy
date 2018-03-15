
const action = require('../actions');
const { DEVICE, DISCOVERY_INTERVAL } = require('../constants');

const timeout = {};
const set = action(DEVICE);

const offline = (id) => (dispatch) => {
  dispatch(set(id, { online: false, ready: false }));
};

const online = (id, type, ip, ready) => (dispatch) => {
  clearTimeout(timeout[id]);
  dispatch(set(id, { type, ip, online: true, ready }));
  timeout[id] = setTimeout(() => {
    dispatch(offline(id));
    delete timeout[id];
  }, 2 * DISCOVERY_INTERVAL);
};

module.exports = { offline, online };
