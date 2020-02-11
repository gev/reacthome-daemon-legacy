
const { get } = require('../actions');
const { sleep } = require('../util');
const { sendAction } = require('../webrtc/peer');
const { ACTION_SET } = require('../constants');
const sendAsset = require('../assets/send');


module.exports = ({ state = [], assets = [] }, session) => {
  state.forEach(async id => {
    await sleep(10);
    sendAction(session, { type: ACTION_SET, id,  payload: get(id) });
  });
  assets.forEach(async asset => {
    await sleep(10);
    sendAsset(session, asset);
  });
};