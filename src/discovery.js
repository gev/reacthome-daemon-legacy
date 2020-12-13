const { networkInterfaces } = require('os');
const { createSocket } = require('dgram');
const { get } = require('./actions');

const DISCOVERY = 'discovery';
const CLIENT_GROUP = '224.0.0.2';
const CLIENT_PORT = 2021;

module.exports.start = (id) => {
  const socket = createSocket('udp4');
  socket.on('error', console.error);
  socket.on('message', (message, {port, address}) => {
    console.log(message, port, address);
    try {
      const { type } = JSON.parse(Buffer.from(message));
      if (type === DISCOVERY) {
        socket.send(JSON.stringify({
          id,
          type: DISCOVERY,
          payload: get(id)
        }), port, address);
      }
    } catch (e) {
      console.error(e);
    }
  });
  socket.on('listening', () => {
    socket.addMembership(CLIENT_GROUP);
  });
  socket.bind(CLIENT_PORT);
};
