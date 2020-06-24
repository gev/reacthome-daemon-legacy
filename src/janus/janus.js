
const WebSocket = require('ws');
const uuid = require('uuid/v4');
const peer = require('../websocket/peer');
const { streams } = require('../camera/streams');
const { TRICKLE, CANDIDATE } = require('./constants');

const TIMEOUT_RECONNECT = 1000;
const TIMEOUT_TRANSACTION = 30000;
const TIMEOUT_TRICKLE = 60000;

const callbacks = new Map();
const handlers = new Map();

let socket;

const connect = () => {
  socket = new WebSocket('ws://localhost:8188', 'janus-protocol');
  socket.on('message', (message) => {
    try {
      const action = JSON.parse(message);
      console.log(JSON.stringify(action, null, 2));
      if (action.transaction) {
        if (callbacks.has(action.transaction)) {
          const callback = callbacks.get(action.transaction);
          callback(action);
        }
      } else if (action.janus === TRICKLE) {
        const {session_id, sender: handle_id, candidate} = action;
        const session = handlers.get(handle_id);
        peer.send(session, {type: CANDIDATE, session_id, handle_id, candidate});
      }
    } catch (e) {
      console.error(e);
    }
  });
  socket.on('close', () => {
    setTimeout(connect, TIMEOUT_RECONNECT);
  });
  socket.on('error', console.error);
  callbacks.clear();
  streams.clear();
};

const send = (action, callback) => {
  try {
    const transaction = uuid();
    if (callback) {
      callbacks.set(transaction, callback);
      setTimeout(() => {
        // callbacks.delete(transaction)
      }, TIMEOUT_TRANSACTION);
    }
    socket.send(JSON.stringify({ ...action, transaction }));
  } catch (e) {
    console.error(e);
  }
};

const bind = (handle_id, session) => {
  handlers.set(handle_id, session);
  setTimeout(() => {
    // handlers.delete(handle_id);
  }, TIMEOUT_TRICKLE)
};


module.exports = { connect, send, bind };
