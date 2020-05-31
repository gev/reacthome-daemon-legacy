
const { Server } = require('ws');
const uuid = require('uuid/v4');
const { deleteTokenByPeer } = require('../notification');
const { peers } = require('./peer');
const handle = require('./handle');

const port = 3000;

module.exports = () => {
  const server = new Server({ port });
  server.on('connection', (socket) => {
    const session = uuid();
    socket.on('message', message => {
      handle(session, message);
    });
    socket.on('error', console.error);
    peers.set(session, {
      send(message, cb) {
        socket.send(JSON.stringify(message), cb);
      }
    });
    socket.on('close', () => {
      deleteTokenByPeer(session);
      peers.delete(session);
    })
  });
};
