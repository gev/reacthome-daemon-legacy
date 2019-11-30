
const { get } = require('../actions');
const { sendAction } = require('../webrtc/peer');
const { ACTION_SET } = require('../constants');
const sendAsset = require('../assets/send');


module.exports = ({ state = [], assets = [] }, session) => {
  let i = 0;
  state.forEach(id => {
    setTimeout(() => {
      sendAction(session, { type: ACTION_SET, id,  payload: get(id) });
    }, i++);
  });
  assets.forEach(asset => {
    setTimeout(() => {
      sendAsset(session, asset);
    }, i++);
  });
};