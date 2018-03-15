
const { combineReducers } = require('redux');
const { DEVICE, STATE } = require('./constants');

const reduce = (action) => (state = {}, { type, id, payload }) =>
  action === type ? { ...state, [id]: { ...state[id], ...payload } } : state;

module.exports = combineReducers({
  device: reduce(DEVICE),
  state: reduce(STATE)
});
