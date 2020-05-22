
const WebSocket = require('ws');
const uuid = require('uuid/v4');
const { TRICKLE } =require('./constants');

const TIMEOUT_RECONNECT = 1000;
const TIMEOUT_TRANSACTION = 10000;

const callbacks = new Map();

let socket;

const connect = () => {
  socket = new WebSocket('ws://localhost:8188', 'janus-protocol');
  socket.on('message', (message) => {
    try {
      const action = JSON.parse(message);
      console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
      console.log(action);
      if (action.transaction) {
        if (callbacks.has(action.transaction)) {
          const callback = callbacks.get(action.transaction);
          callback(action);
        }
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
};

const send = (action, callback) => {
  try {
    const transaction = uuid();
    if (callback) {
      callbacks.set(transaction, callback);
      setTimeout(() => {
        callbacks.delete(transaction)
      }, TIMEOUT_TRANSACTION);
    }
    socket.send(JSON.stringify({ ...action, transaction }));
  } catch (e) {
    console.error(e);
  }
};

module.exports = { connect, send };
