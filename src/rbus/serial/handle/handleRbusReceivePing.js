const { checkCRC } = require("../../crc");
const { ACTION_DISCOVERY } = require("../../../constants");
const { RBUS_PING_FRAME_SIZE } = require("../../constants");
const { rbusTransmitPing } = require("./rbusTransmitPing");
const { getDevice } = require("../../pool");

module.exports.handleRbusReceivePing = (rbus, data) => {
  if (data.length < RBUS_PING_FRAME_SIZE) {
    return;
  }
  if (checkCRC(data)) {
    const address = data[1];
    const device = getDevice(rbus, address);
    console.log(rbus.index, address, rbus.pool, device)
    if (device !== undefined) {
      rbus.socket.send([
        ...device.mac,
        ACTION_DISCOVERY,
        ...device.type
      ]);
    } else {
      rbusTransmitPing(rbus, address);
    }
  }
}
