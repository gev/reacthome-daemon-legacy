
const { run } = require('../controllers/service');
const { ACTION_SET } = require('../constants');

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
