const { RBUS_MESSAGE_SIZE } = require("../../constants");

module.exports.handleTransmitRS485 = (rbus, data) => {
  if (rbus.port.isRBUS) {
    return;
  }
  if (data.length < 2) {
    return;
  }
  if (data.length > 1 + RBUS_MESSAGE_SIZE) {
    return;
  }
  const index = data[0];
  if (index !== 1) {
    return;
  }
  rbus.port.send(data.slice(1));
}
