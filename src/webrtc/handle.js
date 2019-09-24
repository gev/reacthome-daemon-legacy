
const { run } = require('../controllers/service');
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

};
