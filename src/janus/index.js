
const { connect, send } = require('./janus');
const { CREATE, ATTACH, MESSAGE } =require('./constants');

module.exports.start = connect;

module.export.createSession = async () => {
  const { data } = await send({ janus: CREATE });
  return data.id;
};

module.export.attachPlugin = async (session_id, plugin) => {
  const { data } = await send({ janus: ATTACH, session_id, plugin });
  return data.id;
};

module.export.sendMessage = (session_id, handle_id, body, jsep) =>
  send({ janus: MESSAGE, session_id, body, jsep });
