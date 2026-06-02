const { createSocket } = require("dgram");
const { getIP } = require("../util");
const { DEVICE_GROUP } = require("../constants");

module.exports = (port, listen) => {
  const socket = createSocket("udp4");

  const sendUDP = (packet, ip) => {
    socket.send(packet, port, ip, (err) => {
      if (err) console.error(err);
    });
  };

  const sendMulticast = (packet, group) => {
    const ip = getIP("eth1");
    console.log(ip);
    if (ip) {
      socket.setMulticastInterface(ip);
      sendUDP(packet, group);
    }
  }

  socket.on("error", console.error).bind(listen, "0.0.0.0");

  const handle = (handler) => {
    socket.on("message", handler);
  };

  return { handle, sendUDP, sendMulticast };
};
