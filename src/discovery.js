
const { createSocket } = require("dgram");
const { get } = require("./actions");
const { Interface } = require("readline");
const { DEVICE_SERVER_PORT, DEVICE_GROUP, DEVICE_PORT, ACTION_DISCOVERY } = require("./constants");
const os = require('os');
const { ip2int } = require("./util");

const DISCOVERY = "discovery";
const CLIENT_GROUP = "224.0.0.2";
const CLIENT_PORT = 2021;


const discovery = (id, ip) => {
  if (!ip) return;

  const discoveryMessage = JSON.stringify({
    id,
    type: DISCOVERY,
    payload: get(id),
  })

  const data = Buffer.alloc(7);
  data.writeUInt8(ACTION_DISCOVERY, 0);
  data.writeUInt32BE(ip2int(ip), 1);
  data.writeUInt16BE(DEVICE_SERVER_PORT, 5);

  const socket = createSocket({ type: "udp4", reuseAddr: true, reusePort: true });
  socket.on("error", console.error);

  socket.bind(0, ip, () => {
    socket.setMulticastInterface(ip);
    socket.send(data, DEVICE_PORT, DEVICE_GROUP, () => {
      console.log("send discovery 2");
      socket.close();
    });
    // socket.send(discoveryMessage, CLIENT_PORT, CLIENT_GROUP, (err) => {
    //   if (!err) {
    //     console.log("send discovery 1");
    //     socket.send(data, DEVICE_PORT, DEVICE_GROUP, () => {
    //       console.log("send discovery 2");
    //       socket.close();
    //     });
    //   } else {
    //     socket.close();
    //   }
    // });
  })
}

const getIP = (name) => {
  const iface = os.networkInterfaces()[name];
  return iface ? iface.find(a => a.family === 'IPv4' && !a.internal).address : null;
};

module.exports.start = (id) => {
  discovery(id, getIP("eth0"));
  discovery(id, getIP("eth1"));
  setInterval(async () => {
    discovery(id, getIP("eth0"));
    discovery(id, getIP("eth1"));
  }, 10_000)
};


