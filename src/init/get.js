
const { get } = require('../actions');
const { send } = require('../websocket/peer');
const { ACTION_SET } = require('../constants');

module.exports = ({ state = [], assets = [] }, session) => {
  state.forEach(async id => {
    send(session, { type: ACTION_SET, id,  payload: get(id) });
  });
};