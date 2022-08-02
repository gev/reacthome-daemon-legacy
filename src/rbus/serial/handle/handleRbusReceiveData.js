const { RBUS_DATA_FRAME_SIZE, RBUS_DATA_HEADER_SIZE } = require("../../constants");
const { checkCRC } = require("../../crc");
const { rbusTransmitConfirm } = require("./rbusTransmitConfirm");

module.exports.handleRbusReceiveData = (rbus, data) => {
  if (data.length < RBUS_DATA_FRAME_SIZE) {
    return;
  }
  const expectedDataSize = data[3];
  if (data.length < RBUS_DATA_FRAME_SIZE + expectedDataSize) {
    return;
  }
  if (checkCRC(data)) {
    const address = data[1];
    const id = data[2];
    rbusTransmitConfirm(rbus, address);

    if (rbus.rx[address] == id) {
      return;
    }
    rbus.rx[address] = id;
    rbusTransmitData(rbus, data);
  }
}
