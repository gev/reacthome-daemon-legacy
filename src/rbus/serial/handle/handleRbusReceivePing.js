const { checkCRC } = require("../../crc");
const { ACTION_DISCOVERY } = require("../../../constants");
const { RBUS_PING_FRAME_SIZE } = require("../../constants");
const { rbusTransmitPing } = require("./rbusTransmitPing");

module.exports.handleRbusReceivePing = (rbus, data) => {
  if (data.length < RBUS_PING_FRAME_SIZE) {
    return;
  }
  if (checkCRC(data)) {
    const address = data[1];
    const device = rbus.pool[address];
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
