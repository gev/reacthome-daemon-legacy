
const { createSocket } = require("dgram");
const { get } = require("./actions");
const { Interface } = require("readline");
const { DEVICE_SERVER_PORT, DEVICE_GROUP, DEVICE_PORT, ACTION_DISCOVERY } = require("./constants");
const { ip2int, getIP } = require("./util");

const DISCOVERY = "discovery";
const CLIENT_GROUP = "224.0.0.2";
const CLIENT_PORT = 2021;


const discovery = (socket, id, ip) => {
  if (!ip) return;

  const { title, code, type } = get(id) || {};

  const discoveryMessage = JSON.stringify({
    id,
    type: DISCOVERY,
    payload: { title, code, type },
  })


  const discoveryDevice = Buffer.alloc(7);
  discoveryDevice.writeUInt8(ACTION_DISCOVERY, 0);
  discoveryDevice.writeUInt32BE(ip2int(ip), 1);
  discoveryDevice.writeUInt16BE(DEVICE_SERVER_PORT, 5);

  socket.setMulticastInterface(ip);
  socket.send(discoveryMessage, CLIENT_PORT, CLIENT_GROUP);
  socket.send(discoveryDevice, DEVICE_PORT, DEVICE_GROUP);
}

module.exports.start = (id) => {
  const socket = createSocket({ type: "udp4", reuseAddr: true, reusePort: true });
  socket.on("error", console.error);

  socket.bind(0, "0.0.0.0", () => {
    discovery(socket, id, getIP("eth0"));
    discovery(socket, id, getIP("eth1"));
    setInterval(async () => {
      discovery(socket, id, getIP("eth0"));
      discovery(socket, id, getIP("eth1"));
    }, 10_000)
  });
};


