
const WebSocket = require('ws');
const uuid = require('uuid/v4');
const { TRICKLE } =require('./constants');

const TIMEOUT_RECONNECT = 1000;
const TIMEOUT_TRANSACTION = 10000;

const callbacks = new Map();

let socket;

const connect = () => {
  const socket = new WebSocket('ws://localhost:8188', 'janus-protocol');
  socket.on('message', (message) => {
    console.log(message);
    try {
      const data = JSON.parse(message);
      if (data.transaction) {
        const callback = callbacks.get(data.transaction);
        if (callback) {
          callback(data);
        }
      } else if (data.janus === TRICKLE) {

      }
    } catch (e) {
      console.log(e);
    }
  };
  callbacks.clear();
};

socket.on('close', () => {
  setTimeout(connect, TIMEOUT_RECONNECT);
});

socket.on('error', console.error);

const send = (o) => new Promise ((resolve, reject) => {
  try {
    const transaction = uuid();
    callbacks.set(transaction, resole);
    socket.send(JSON.stringify({ ...o, transaction }), (err) => {
      if (err) {
        reject(err);
      }
    });
    setTimeout(callbacks.delete, TIMEOUT_TRANSACTION, transaction);
    } catch (e) {
      reject(e);
    }
});

module.exports = { connect, send };
