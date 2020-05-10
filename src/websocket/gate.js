
const WebSocket = require('ws');
const { isUUID } = require('../uuid');
const { peers } = require('./peer');
const handle = require('./handle');

const PROTOCOL = 'listen';
const TIMEOUT = 3000;
const gateURL = id => `wss://gate.reacthome.net/${id}`;

let t;
const sessions = new Set();

const connect = (id) => {
  const socket = new WebSocket(gateURL(id), PROTOCOL);
  socket.on('message', (message) => {
    const session = message.substring(0, 36);
    if (!isUUID.test(session)) return;
    if (!sessions.has(session)) {
      sessions.add(session);
      peers.set(session, {
        send(message) {
          socket.send(`${session}${JSON.stringify(message)}`);
        }
      });
    }
    handle(session, message.substring(36));
  });
  socket.on('close', () => {
    for(const session of sessions) {
      peers.delete(session);
      sessions.delete(session);
    }
    setTimeout(connect, TIMEOUT, id);
  });
  socket.on('open', () => {
    clearInterval(t);
    t = setInterval(() => {
      socket.ping();
    }, TIMEOUT);
  });
  socket.on('error', console.error);
};

module.exports = connect;
