const { RBUS_CONFIRM_FRAME_SIZE } = require("../../constants");
const { checkCRC } = require("../../crc");

module.exports.handleRbusReceiveConfirm = (rbus, data) => {
  if (data.length < RBUS_CONFIRM_FRAME_SIZE) {
    return;
  }
  if (checkCRC(data)) {
    const address = data[1];
    rbus.tx = rbus.tx.filter(
      i => i.address !== address
    );
  }
}
