
const { get } = require('../actions');
const { sendAction } = require('../webrtc/peer');
const { ACTION_SET } = require('../constants');
const sendAsset = require('../assets/send');


module.exports = ({ state = [], assets = [] }, session) => {
  state.forEach(id => {
    sendAction(session, { type: ACTION_SET, id,  payload: get(id) });
  });
  assets.forEach(asset => {
    console.log(asset);
    sendAsset(session, asset);
  });
};