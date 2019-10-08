
const { get } = require('../actions');
const { sendAction } = require('../webrtc/peer');
const { ACTION_SET } = require('../constants');


const sendAsset = (name) => {

}

module.exports = ({ state, assets }, session) => {
  state.forEach(id => {
    sendAction({ type: ACTION_SET, id,  payload: get(id) });
  });
  assets.forEach(sendAsset(session))
};