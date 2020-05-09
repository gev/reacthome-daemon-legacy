
const { Server } = require('ws');
const uuid = require('uuid/v4');
const { peers } = require('./peer');
const handle = require('./handle');

const port = 3000;

module.exports = () => {
  const server = new Server({ port });
  server.on('connection', (socket) => {
    const session = uuid();
    const send = (message) => {
      soket.send(JSON.stringify(message));
    } 
    socket.on('message', message => {
      handle(session, message);
    });
    socket.on('error', console.error);
    peers.set(session, send);
  });
};
