const { RBUS_CONFIRM_PREAMBLE_TRANSMIT } = require("../../constants");
const { addCRC } = require("../../crc")

module.exports.rbusTransmitConfirm = (rbus, address) => {
  rbus.port.sendRBUS(Array.from([
    RBUS_CONFIRM_PREAMBLE_TRANSMIT,
    address
  ]));
}
