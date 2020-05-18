
const { get } = require('../actions');
const { send } = require('../websocket/peer');
const { ACTION_SET } = require('../constants');

module.exports = ({ state = [], assets = [] }, session) => {
  state.forEach(id => {
    send(session, { type: ACTION_SET, id, payload: get(id) });
  });
  // assets.forEach(id => {
  //   send(session, { type: ACTION_ASSET, id, })
  // })
};
