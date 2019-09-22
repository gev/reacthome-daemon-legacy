
const { Server } = require('ws');
const uuid = require('uuid/v4');

module.exports = (handle) => {
  const server = new Server({ port: 3000 });
  server.on('connection', (socket, request) => {
    const session = uuid();
    socket.on('message', message => {
      handle(
        session,
        message,
        action => socket.send(JSON.stringify(action))
      );
    });
    socket.on('error', console.log);
  });
};
