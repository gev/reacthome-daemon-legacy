const { RBUS_PING_PREAMBLE_TRANSMIT } = require("../../constants")
const { addCRC } = require("../../crc")

module.exports.rbusTransmitPing = (rbus, address) => {
  rbus.port.sendRBUS(Array.from([
    RBUS_PING_PREAMBLE_TRANSMIT,
    address
  ]));
};
