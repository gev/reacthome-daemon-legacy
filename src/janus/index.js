
const { connect, send } = require('./janus');
const { CREATE, ATTACH, MESSAGE, TRICKLE } =require('./constants');

module.exports.start = connect;

module.exports.createSession = async () => {
  const { data } = await send({ janus: CREATE });
  return data.id;
};

module.exports.attachPlugin = async (session_id, plugin) => {
  const { data } = await send({ janus: ATTACH, session_id, plugin });
  return data.id;
};

module.exports.sendMessage = (session_id, handle_id, body, jsep) =>
  send({ janus: MESSAGE, session_id, handle_id, body, jsep });

module.exports.trickle = ({ session_id, handle_id, candidate }) =>
  send({ janus: TRICKLE, session_id, handle_id, candidate: [candidate] });
