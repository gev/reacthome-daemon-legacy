const { RBUS_PING_PREAMBLE_TRANSMIT } = require("../../constants")

module.exports.rbusTransmitPing = (rbus, address) => {
  rbus.port.sendRBUS([
    RBUS_PING_PREAMBLE_TRANSMIT,
    address
  ]);
};
