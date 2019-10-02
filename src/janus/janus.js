
const WebSocket = require('ws');
const uuid = require('uuid/v4');
const { TRICKLE } =require('./constants');

const TIMEOUT_RECONNECT = 1000;
const TIMEOUT_TRANSACTION = 10000;

const promises = new Map();

let socket;

const connect = () => {
  socket = new WebSocket('ws://localhost:8188', 'janus-protocol');
  socket.on('message', (message) => {
    console.log(message);
    try {
      const action = JSON.parse(message);
      if (action.transaction) {
        Promise.resolve(promises.get(action.transaction));
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
  promises.clear();
};

const send = (action) => {
  const transaction = uuid();
  const promise = new Promise ((resolve, reject) => {
    try {
      socket.send(JSON.stringify({ ...action, transaction }), (err) => {
        if (err) {
          reject(err);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
  promises.set(transaction, promise);
  setTimeout(() => {
    promises.delete(transaction)
  }, TIMEOUT_TRANSACTION);
  return promise;
}

module.exports = { connect, send };
