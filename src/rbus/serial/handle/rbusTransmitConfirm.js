const { RBUS_CONFIRM_PREAMBLE_TRANSMIT } = require("../../constants");

module.exports.rbusTransmitConfirm = (rbus, address) => {
  rbus.port.sendRBUS([
    RBUS_CONFIRM_PREAMBLE_TRANSMIT,
    address
  ]);
}
