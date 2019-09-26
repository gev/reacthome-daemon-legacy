
const { createSocket } = require('dgram');
const { DAEMON, VERSION, ACTION_DISCOVERY } = require('./constants');
const { get } = require('./actions');

const CLIENT_PORT = 2021;
const CLIENT_GROUP = '224.0.0.2';
const TIMEOUT = 1000;

module.exports = (id) => {
  const socket = createSocket('udp4');
  socket.on('error', console.error);
  socket.bind(() => {
    const interface = '192.168.88.188';
    socket.setMulticastInterface(interface)
    const discovery = JSON.stringify({
      id,
      type: ACTION_DISCOVERY,
      payload: { ...get(id), type: DAEMON, version: VERSION }
    });
    setInterval(() => {
      socket.send(discovery, CLIENT_PORT, CLIENT_GROUP);
    }, TIMEOUT);
  });
};
