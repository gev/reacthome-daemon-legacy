
const assets = require('../assets');
const state = require('../controllers/state');
const { sendAction } = require('../webrtc/peer');
const { LIST } = require('./constants');

module.exports = async (session) => {
  console.log(state.state());
  sendAction(session, {
    type: LIST,
    state: state.list(),
    assets: await assets.list()
  });
};
