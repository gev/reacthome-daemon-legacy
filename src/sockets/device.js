
const { get } = require('../controllers/state');
const {
  DISCOVERY_INTERVAL,
  ACTION_DISCOVERY,
  DEVICE_GROUP,
  DEVICE_PORT,
  DEVICE_SERVER_PORT,
  IP_ADDRESS,
  ACTION_RBUS_TRANSMIT,
  ACTION_SMART_TOP,
} = require('../constants');
const socket = require('./socket');

queue = [];

const device = socket((socket) => {
  const data = Buffer.alloc(7);
  data.writeUInt8(ACTION_DISCOVERY, 0);
  data.writeUInt32BE(IP_ADDRESS, 1);
  data.writeUInt16BE(socket.address().port, 5);
  return () => {
    queue.push(() => {
      device.send(data, DEVICE_GROUP);
    });
  };
}, DISCOVERY_INTERVAL, DEVICE_PORT, DEVICE_SERVER_PORT, '172.16.0.1');


device.sendRBUS = (data, id) => {
  queue.push(() => {
    const mac = id.split(":").map((i) => parseInt(i, 16));
    const header = [ACTION_RBUS_TRANSMIT, ...mac];
    const dev = get(id);
    if (dev) {
      if (dev.hub) {
        device.send(Buffer.from([...header, dev.port, dev.address, ...data]), dev.ip);
      } else {
        device.send(Buffer.from([...header, ...data]), dev.ip);
      }
    }
  });
}


device.sendTOP = (data, id) => {
  queue.push(() => {
    const { bottom } = get(id) || {};
    if (bottom) {
      // console.log(data, bottom)
      device.sendRBUS([ACTION_SMART_TOP, ...data], bottom);
    }
  });
}

setInterval(() => {
  const run = queue.shift();
  if (run) {
    run();
  }
}, 1);


module.exports = device;
