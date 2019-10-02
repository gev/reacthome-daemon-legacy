
const state = require('../controllers');

module.exports = (action, session) => {
  const timestamp = action.timestamp || 0;
  Object
    .entries(state())
    .filter(([id, payload]) =>
      payload && !payload instanceof Array && payload instanceof Object && payload.timestamp > timestamp)
    .forEach(([id, payload], i, { length }) => {
      sendAction(session, { type: 'init', id, payload, current: i + 1, total: length });
    });
};
