const { createSocket } = require("dgram");
const { get } = require("./actions");

const DISCOVERY = "discovery";
const CLIENT_GROUP = "224.0.0.2";
const CLIENT_PORT = 2021;

module.exports.start = (id) => {
  const socket = createSocket({ type: "udp4", reuseAddr: true });
  const discoveryMessage = JSON.stringify({
    id,
    type: DISCOVERY,
    payload: get(id),
  })
  socket.on("error", console.error);
  socket.on("listening", () => {
    socket.addMembership(CLIENT_GROUP);
  });
  setInterval(() => {
    socket.send(discoveryMessage, CLIENT_PORT, "192.168.11.255");
    socket.send(discoveryMessage, CLIENT_PORT, CLIENT_GROUP);
  }, 10_000)
};
