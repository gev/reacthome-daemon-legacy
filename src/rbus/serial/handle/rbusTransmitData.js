const { getDevice } = require("../../pool");

module.exports.rbusTransmitData = (rbus, id, address, data) => {
  if (rbus.rx[address] == id) {
    return;
  }
  rbus.rx[address] = id;
  const device = getDevice(rbus, address);
  if (device !== undefined) {
    rbus.socket.sendRBUS([
      ...device.mac,
      ...data
    ]);
  }
}