
const { list } = require('../controllers/state');
const { send } = require('../websocket/peer');
const { LIST } = require('./constants');

module.exports = async (session) => {
  const state = list();
  const assets = [];
  Object.values(state).forEach(({image}) => {
    if (image && !assets.includes(image)) {
      assets.push(image);
    }
  });
  send(session, { type: LIST,  state, assets });
};
