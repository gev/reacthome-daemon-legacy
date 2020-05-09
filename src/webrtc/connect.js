
const WebSocket = require('ws');
const { isUUID } = require('../uuid');
const { ICE, gateURL } = require('./config');

const PROTOCOL = 'listen';
const TIMEOUT = 3000;

const connect = (id, handle) => {
  let t;
  const socket = new WebSocket(gateURL(id), PROTOCOL);
  socket.on('open', () => {
    t = setInterval(() => {
      socket.ping();
    }, TIMEOUT);
  });
  socket.on('message', (message) => {
    const session = message.substring(0, 36);
    if (!isUUID.test(session)) return;
    handle(
      session,
      message.substring(36),
      action => socket.send(`${session}${JSON.stringify(action)}`),
    );
  });
  socket.on('close', () => {
    clearInterval(t);
    setTimeout(connect, TIMEOUT, id, handle);
  });
  socket.on('error', console.error);
};

module.exports = connect;
