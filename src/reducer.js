
const { combineReducers } = require('redux');
const { DEVICE, CHANNEL, STATE } = require('./constants');

const put = (type) => (state = [], action) => {
  switch (action.type) {
    case ACTION_ADD:
      if (type !== action.payload.type) return state;
      return [...state, action.payload.id];
    default:
      return state;
  }
};

const pool = (state = {}, { type, id, payload }) => {
  switch (type) {
    case ACTION_SET:
      return { ...state, [id]: { ...state[id], ...payload } };
    default:
      return state;
  }
};
    
module.exports = combineReducers({
  [DEVICE]: put(DEVICE),
  pool
});
