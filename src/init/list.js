
const state = require('../controllers/state');
const { send } = require('../websoket/peer');
const { LIST } = require('./constants');

module.exports = async (session) => {
  send(session, { type: LIST, state: state.list() });
};
