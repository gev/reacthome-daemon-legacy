
const { connect, send, bind } = require('./janus');
const { CREATE, ATTACH, MESSAGE, TRICKLE } =require('./constants');

module.exports.start = connect;

module.exports.createSession = (callback) => {
  send({ janus: CREATE }, ({ data }) => {
    session_id = data.id;
    callback(session_id);
  });
};

module.exports.attachPlugin = (session_id, plugin, callback) => {
  send({ janus: ATTACH, session_id, plugin }, ({ data }) => {
    callback(data.id);
  });
};

module.exports.send = (session_id, handle_id, body, jsep, callback) => {
  if (callback === undefined) {
    if (jsep instanceof Function) {
      callback = jsep;
      jsep = undefined;
    }
  }
  send({ janus: MESSAGE, session_id, handle_id, body, jsep }, callback);
};

module.exports.trickle = ({ session_id, handle_id, candidate }, callback) => {
  send({ janus: TRICKLE, session_id, handle_id, candidate }, callback);
};

module.exports.bind = bind;
