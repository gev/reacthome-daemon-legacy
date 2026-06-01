
const { createSocket } = require("dgram");
const { get } = require("./actions");
const { Interface } = require("readline");
const { DEVICE_SERVER_PORT, DEVICE_GROUP, DEVICE_PORT, ACTION_DISCOVERY } = require("./constants");
const os = require('os');
const { ip2int } = require("./util");

const DISCOVERY = "discovery";
const CLIENT_GROUP = "224.0.0.2";
const CLIENT_PORT = 2021;


const discovery = async (id, ip) => {
  if (!ip) return;
  const socket = createSocket({ type: "udp4", reuseAddr: true, reusePort: true });
  socket.on("error", console.error);
  const discoveryMessage = JSON.stringify({
    id,
    type: DISCOVERY,
    payload: get(id),
  })

  socket.bind(0, () => {
    socket.setMulticastInterface(ip);
  })

  await socket.send(discoveryMessage, CLIENT_PORT, CLIENT_GROUP);

  const data = Buffer.alloc(7);
  data.writeUInt8(ACTION_DISCOVERY, 0);
  data.writeUInt32BE(ip2int(ip), 1);
  data.writeUInt16BE(socket.address().port, 5);
  await socket.send(data, DEVICE_PORT, DEVICE_GROUP);

  socket.close()
}

const getIP = (name) => {
  const iface = os.networkInterfaces()[name];
  return iface ? iface.find(a => a.family === 'IPv4' && !a.internal).address : null;
};

module.exports.start = (id) => {
  discovery(id, getIP("eth0"));
  discovery(id, getIP("eth1"));
  // socket.bind(() => {
  //   socket.setMulticastInterface("172.16.0.1")
  setInterval(async () => {
  }, 10_000)

  // })
};


