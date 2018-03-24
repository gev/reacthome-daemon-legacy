
const { combineReducers } = require('redux');
const { DEVICE, CHANNEL, STATE } = require('./constants');

const reduce = (action) => (state = {}, { type, id, payload }) =>
  action === type ? { ...state, [id]: { ...state[id], ...payload } } : state;

module.exports = combineReducers({
  [CHANNEL]: reduce(CHANNEL),
  [DEVICE]: reduce(DEVICE),
  [STATE]: reduce(STATE)
});
