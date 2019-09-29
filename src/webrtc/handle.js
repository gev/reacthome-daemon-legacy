
const { run } = require('../controllers/service');
const { state } = require('../controllers/state');
const { ACTION_SET } = require('../constants');
const { sendAction } = require('./peer');

module.exports.onAction = (session) => ({ data }) => {
  try {
    const action = JSON.parse(Buffer.from(data));
    run(action, session);
  } catch(e) {
    console.error(e);
  }
};

module.exports.onAsset = ({ data }) => {
};

module.exports.onConnect = (timestamp = 0, session) => {
  Object.entries(state()).forEach(([id, payload]) => {
    if (!payload) return;
    if (payload instanceof Array) return;
    if (payload instanceof Object && payload.timestamp > timestamp) {
      sendAction(session, { type: ACTION_SET, id, payload });
    }
  })
};
