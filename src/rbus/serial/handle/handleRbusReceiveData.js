const { RBUS_DATA_FRAME_SIZE, RBUS_DATA_HEADER_SIZE } = require("../../constants");
const { rbusTransmitConfirm } = require("./rbusTransmitConfirm");
const { rbusTransmitData } = require("./rbusTransmitData");
const { checkCRC } = require("../../crc");

module.exports.handleRbusReceiveData = (rbus, data) => {
  if (data.length < RBUS_DATA_FRAME_SIZE) {
    return;
  }
  const expectedDataSize = data[3];
  if (data.length < RBUS_DATA_FRAME_SIZE + expectedDataSize) {
    return;
  }
  if (checkCRC(data)) {
    const id = data[2];
    const address = data[1];
    rbusTransmitConfirm(rbus, address);
    rbusTransmitData(rbus, id, address,
      data.slice(RBUS_DATA_HEADER_SIZE,
        RBUS_DATA_HEADER_SIZE + expectedDataSize));
  }
}
