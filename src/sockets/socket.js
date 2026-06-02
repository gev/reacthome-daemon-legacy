const { createSocket } = require("dgram");
const { getIP } = require("../util");

module.exports = (port, listen) => {
  const socket = createSocket("udp4");

  const sendUDP = (packet, ip) => {
    socket.send(packet, port, ip, (err) => {
      if (err) console.error(err);
    });
  };

  const sendMilticast = (packet) => {
    const ip = getIP("eth1");
    if (ip) {
      socket.setMulticastInterface(ip);
      sendUDP(packet, DEVICE_GROUP);
    }
  }

  socket.on("error", console.error).bind(listen, "0.0.0.0");

  const handle = (handler) => {
    socket.on("message", handler);
  };

  return { handle, sendUDP, sendMilticast };
};
