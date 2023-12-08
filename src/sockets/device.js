
const { get } = require('../state');
const {
  DISCOVERY_INTERVAL,
  ACTION_DISCOVERY,
  DEVICE_GROUP,
  DEVICE_PORT,
  DEVICE_SERVER_PORT,
  IP_ADDRESS,
  ACTION_RBUS_TRANSMIT,
} = require('../constants');
const socket = require('./socket');

const device = socket((socket) => {
  const data = Buffer.alloc(7);
  data.writeUInt8(ACTION_DISCOVERY, 0);
  data.writeUInt32BE(IP_ADDRESS, 1);
  data.writeUInt16BE(socket.address().port, 5);
  return () => {
    device.send(data, DEVICE_GROUP);
  };
}, DISCOVERY_INTERVAL, DEVICE_PORT, DEVICE_SERVER_PORT, '172.16.0.1');


device.sendRBUS = (data, id) => {
  const mac = id.split(":").map((i) => parseInt(i, 16));
  const header = [ACTION_RBUS_TRANSMIT, ...mac];
  const dev = get(id);
  if (dev) {
    console.log(id, dev.ip, data)
    if (dev.hub) {
      device.send(Buffer.from([...header, dev.port, dev.address, ...data]), dev.ip);
    } else {
      device.send(Buffer.from([...header, ...data]), dev.ip);
    }
  }
}




module.exports = device;
