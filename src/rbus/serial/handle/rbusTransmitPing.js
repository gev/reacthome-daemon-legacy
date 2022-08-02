const { RBUS_PING_PREAMBLE_TRANSMIT, RBUS_ADDERSS } = require("../../constants")
const { addCRC } = require("../../crc")

module.exports.rbusTransmitPing = (rbus) => {
  rbus.port.send(addCRC(Array.from([
    RBUS_PING_PREAMBLE_TRANSMIT,
    RBUS_ADDERSS
  ])));
};
