
const { ACTION_SET } = require('./constants');

module.exports = (state = {}, { type, id, payload }) => {
  switch (type) {
    case ACTION_SET:
      return { ...state, [id]: { ...state[id], ...payload } };
    default:
      return state;
  }
}; 
