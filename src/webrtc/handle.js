
const { run } = require('../controllers/service');

module.exports.onAction = ({ data }) => {
  try {
    const action = JSON.parse(Buffer.from(data));
    run(action);
  } catch(e) {
    console.error(e);
  }
};
