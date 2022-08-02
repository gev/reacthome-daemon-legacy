const { macS } = require("../../mac");
const { checkCRC } = require("../../crc");
const { getAddress } = require("../../pool");
const { rbusTransmitDiscovery } = require("./rbusTransmitDiscovery");
const { RBUS_DISCOVERY_RX_BUFFER_SIZE } = require("../../constants");

module.exports.handleRbusReceiveDiscovery = (rbus, data) => {
  if (data.length < RBUS_DISCOVERY_RX_BUFFER_SIZE) {
    return;
  }
  if (checkCRC(data)) {
    const mac = Array.from(data.slice(1, 7));
    const type = [data[7], data[8], data[9]];
    const address = getAddress(rbus, mac, type);
    console.log(address);
    if (address >= 0) {
      rbusTransmitDiscovery(rbus, address, mac);
    } else {
      //TODO error: max number devices on the line
    }
    return;
  }
}
