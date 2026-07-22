const dgram = require('dgram');
const { DEVICE_PORT, DEVICE_SERVER_PORT, ACTION_READY, ACTION_DISCOVERY, ACTION_INITIALIZE, DEVICE_TYPE_SERVER } = require('../../constants');
const { handle } = require('./handle');

const connect = (rbus, host) => {
  const socket = dgram.createSocket('udp4');
  socket.bind(DEVICE_PORT, host);
  socket.on('message', handle(rbus));
  socket.on('error', () => {
    setTimeout(() => {
      connect(rbus, host);
    }, 1000)
  });
  const send = (data) => {
    if (rbus.mac) {
      socket.send(
        Buffer.concat([rbus.mac, data]),
        DEVICE_SERVER_PORT,
        '127.0.0.1'
      )
    }
  }

  rbus.socket = {
    host, send,
    close: socket.close
  }
  // setInterval(() => {
  //   // console.log(rbus);
  //   if (rbus.mac) {
  //     send(Buffer.from([
  //       // rbus.ready ? ACTION_READY : ACTION_DISCOVERY,
  //       ACTION_DISCOVERY,
  //       rbus.type || 0,
  //       rbus.version.major, rbus.version.minor // Version
  //     ]))
  //     if (!rbus.ready) {
  //       send(Buffer.from([ACTION_INITIALIZE]));
  //       rbus.ready = true;
  //     }
  //   }
  // }, 1_000)
};

module.exports.createSocket = connect;
