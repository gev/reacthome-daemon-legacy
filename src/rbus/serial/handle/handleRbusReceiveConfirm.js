const { RBUS_CONFIRM_FRAME_SIZE } = require("../../constants");
const { checkCRC } = require("../../crc");

module.exports.handleRbusReceiveConfirm = (rbus, data) => {
  if (data.length < RBUS_CONFIRM_FRAME_SIZE) {
    return;
  }
  if (checkCRC(data)) {
    const address = data[1];
    index = rbus.tx.findIndex(
      i => i.address === address
    );
    if (i < 0) {
      return;
    }
    rbus.tx.splice(index, 1);
  }
}
