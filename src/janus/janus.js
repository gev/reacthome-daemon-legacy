
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
      const data = JSON.parse(message);
      if (data.transaction) {
        const callback = callbacks.get(data.transaction);
        if (callback) {
          console.log(callback);
          callback(data);
        }
      } else if (data.janus === TRICKLE) {

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

const send = (o) => new Promise ((resolve, reject) => {
  try {
    const transaction = uuid();
    callbacks.set(transaction, resolve);
    socket.send(JSON.stringify({ ...o, transaction }), (err) => {
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
