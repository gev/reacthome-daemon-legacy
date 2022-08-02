const { RBUS_DISCOVERY_PREAMBLE_TRANSMIT } = require("../../constants")

module.exports.rbusTransmitDiscovery = (rbus, address, mac) => {
  rbus.port.sendRBUS([
    RBUS_DISCOVERY_PREAMBLE_TRANSMIT,
    ...mac,
    address
  ]);
};
