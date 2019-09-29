
const { createSocket } = require('dgram');
const { DAEMON, VERSION} = require('./constants');
const { get } = require('./actions');

const DISCOVERY = 'discovery';

const CLIENT_PORT = 2021;
const CLIENT_GROUP = '224.0.0.2';
const TIMEOUT = 1000;

module.exports = (id) => {
  const socket = createSocket('udp4');
  socket.on('error', console.error);
  socket.bind(() => {
    const interface = '192.168.88.188';
    socket.setMulticastInterface(interface)
    setInterval(() => {
      const { code, title, project } = get(id);
      socket.send(JSON.stringify({
        id,
        type: DISCOVERY,
        payload: { code, title, project, type: DAEMON, version: VERSION }
      }), CLIENT_PORT, CLIENT_GROUP);
    }, TIMEOUT);
  });
};
