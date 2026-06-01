const { createSocket } = require("dgram");

module.exports = (port, listen) => {
  const socket = createSocket("udp4");

  const sendUDP = (packet, ip) => {
    socket.send(packet, port, ip, (err) => {
      if (err) console.error(err);
    });
  };

  socket.on("error", console.error).bind(listen, "172.16.1.0");

  const handle = (handler) => {
    socket.on("message", handler);
  };

  return { handle, sendUDP };
};
