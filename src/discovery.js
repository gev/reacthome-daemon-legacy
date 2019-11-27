
const { networkInterfaces } = require('os');
const { createSocket } = require('dgram');
const { DAEMON, VERSION} = require('./constants');
const { get } = require('./actions');

const DISCOVERY = 'discovery';

const CLIENT_PORT = 2021;
const CLIENT_GROUP = '224.0.0.2';
const TIMEOUT = 1000;

module.exports.start = (id) => {
  const socket = createSocket('udp4');
  socket.on('error', console.error);
  socket.bind(() => {
    socket.setMulticastInterface(networkInterfaces().eth1[0].address)
    setInterval(() => {
      socket.send(JSON.stringify({
        id,
        type: DISCOVERY,
        payload: get(id)
      }), CLIENT_PORT, CLIENT_GROUP);
    }, TIMEOUT);
  });
};
