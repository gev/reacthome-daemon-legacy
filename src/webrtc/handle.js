
const { run } = require('../controllers/service');
const { state } = require('../controllers/state');
const { ACTION_SET } = require('../constants');
const { send } = require('./peer');

module.exports.onAction = ({ data }) => {
  try {
    const action = JSON.parse(Buffer.from(data));
    run(action);
  } catch(e) {
    console.error(e);
  }
};

module.exports.onConnect = (session) => {
  Object.entries(state).forEach(([id, payload]) => {
    send(session, JSON.stringify({ type: ACTION_SET, id, payload }));
  })
};
