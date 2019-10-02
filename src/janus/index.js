
const { connect, send } = require('./janus');
const { CREATE, ATTACH, MESSAGE, TRICKLE } =require('./constants');

module.exports.start = connect;

module.exports.createSession = (callback) => {
  send({ janus: CREATE }, ({ data }) => {
    callback(data.id);
  });
};

module.exports.attachPlugin = (session_id, plugin, callback) => {
  send({ janus: ATTACH, session_id, plugin }, ({ data }) => {
    callback(data.id);
  });
};

module.exports.sendMessage = (session_id, handle_id, body, jsep, callback) => {
  if (callback === undefined) {
    if (jsep instanceof Function) {
      callback = jsep;
      jsep = undefined;
    }
  }
  send({ janus: MESSAGE, session_id, handle_id, body, jsep }, callback);
};

module.exports.trickle = ({ session_id, handle_id, candidate }, callback) => {
  send({ janus: TRICKLE, session_id, handle_id, candidate: [candidate] }, callback);
};
