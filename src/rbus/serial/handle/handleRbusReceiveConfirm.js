const { crc16 } = require("crc");

module.exports.handleRbusReceiveConfirm = (rbus, data) => {
  console.log(rbus.index, data);
}
