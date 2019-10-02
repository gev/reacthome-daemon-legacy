
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
    console.log(message);
    try {
      const action = JSON.parse(message);
      if (action.transaction) {
        const callback = callbacks.get(action.transaction);
        if (callback) {
          callback(action);
        }
      } else if (action.janus === TRICKLE) {

      }
    } catch (e) {
      console.log(e);
    }
  });
  socket.on('close', () => {
    setTimeout(connect, TIMEOUT_RECONNECT);
  });
  socket.on('error', console.error);
  callbacks.clear();
};

const send = (action) => new Promise ((resolve, reject) => {
  try {
    console.log(this);
    const transaction = uuid();
    callbacks.set(transaction, resolve);
    socket.send(JSON.stringify({ ...action, transaction }), (err) => {
      if (err) {
        reject(err);
      }
    });
    setTimeout(() => {
      callbacks.delete(transaction)
    }, TIMEOUT_TRANSACTION);
  } catch (e) {
    reject(e);
  }
});

module.exports = { connect, send };
