
const { send } = require('./janus');
const { TRICKLE } =require('./constants');

module.exports = ({ session_id, handle_id, candidate }) =>
  send({ janus: TRICKLE, session_id, handle_id, candidate: [candidate] });
