const { getDevice } = require("../../pool");

module.exports.rbusTransmitData = (rbus, data) => {
  const id = data[2];
  if (rbus.rx[address] == id) {
    return;
  }
  rbus.rx[address] = id;
  const device = getDevice(rbus, address);
  if (device !== undefined) {
    rbus.socket.sendRBUS([
      ...device.mac,
      ...data.slice(RBUS_DATA_HEADER_SIZE, RBUS_DATA_HEADER_SIZE + data[3])
    ]);
  }
}