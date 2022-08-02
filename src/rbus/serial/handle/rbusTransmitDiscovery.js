const { RBUS_DISCOVERY_PREAMBLE_TRANSMIT } = require("../../constants")
const { addCRC } = require("../../crc")

module.exports.rbusTransmitDiscovery = (rbus, address, mac) => {
  rbus.port.sendRBUS(Array.from([
    RBUS_DISCOVERY_PREAMBLE_TRANSMIT,
    ...mac,
    address
  ]));
};
