const { get } = require("../controllers/state");
const {
  DISCOVERY_INTERVAL,
  ACTION_DISCOVERY,
  DEVICE_GROUP,
  DEVICE_PORT,
  DEVICE_SERVER_PORT,
  IP_ADDRESS,
  ACTION_RBUS_TRANSMIT,
  ACTION_SMART_TOP,
} = require("../constants");
const socket = require("./socket");

queue = [];

const device = socket(
  (socket) => {
    const data = Buffer.alloc(7);
    data.writeUInt8(ACTION_DISCOVERY, 0);
    data.writeUInt32BE(IP_ADDRESS, 1);
    data.writeUInt16BE(socket.address().port, 5);
    return () => {
      device.sendUDP(data, DEVICE_GROUP);
    };
  },
  DISCOVERY_INTERVAL,
  DEVICE_PORT,
  DEVICE_SERVER_PORT,
  "172.16.0.1",
);

device.sendRBUS = (data, id) => {
  push(() => {
    const mac = id.split(":").map((i) => parseInt(i, 16));
    const header = [ACTION_RBUS_TRANSMIT, ...mac];
    const dev = get(id);
    let buff;
    if (dev) {
      if (dev.hub) {
        buff = Buffer.from([...header, dev.port, dev.address, ...data]);
        // console.log("send rbus via hub", buff);
      } else {
        buff = Buffer.from([...header, ...data]);
      }
      device.sendUDP(buff, dev.ip);
    }
  });
};

device.sendTOP = (data, id) => {
  push(() => {
    const { bottom } = get(id) || {};
    if (bottom) {
      // console.log("send top", data);
      device.sendRBUS([ACTION_SMART_TOP, ...data], bottom);
    }
  });
};

device.send = (data, id) => {
  const { type, ip } = get(id) || {};
  switch (dev.type) {
    case DEVICE_TYPE_SMART_TOP_A6P:
    case DEVICE_TYPE_SMART_TOP_G4D:
    case DEVICE_TYPE_SMART_TOP_A4T:
    case DEVICE_TYPE_SMART_TOP_A6T:
    case DEVICE_TYPE_SMART_TOP_G6:
    case DEVICE_TYPE_SMART_TOP_G4:
    case DEVICE_TYPE_SMART_TOP_G2:
    case DEVICE_TYPE_SMART_TOP_A4P:
    case DEVICE_TYPE_SMART_TOP_A4TD:
    case DEVICE_TYPE_SMART_TOP_A4TD_7S:
    case DEVICE_TYPE_SMART_TOP_CARD_HOLDER: {
      sendTOP(data, id);
      break;
    }
    case DEVICE_TYPE_SERVER:
    case DEVICE_TYPE_RS_HUB4:
    case DEVICE_TYPE_SOUNDBOX: {
      send(data, dev.ip);
      break;
    }
    default: {
      sendRBUS(data, id);
    }
  }
};

setInterval(() => {
  const run = queue.shift();
  if (run) {
    run();
  }
}, 10);

const push = (run) => {
  queue.push(run);
};

module.exports = device;
