const { RBUS_DISCOVERY_RX_BUFFER_SIZE } = require("../../constants");
const { checkCRC } = require("../../crc");
const { macS } = require("../../mac");
const { getAddress } = require("../../pool");
const { rbusTransmitDiscovery } = require("./rbusTransmitDiscovery");

module.exports.handleRbusReceiveDiscovery = (rbus, data) => {
  console.log(rbus.index, data, checkCRC(data));
  if (data.length < RBUS_DISCOVERY_RX_BUFFER_SIZE) {
    return;
  }
  if (checkCRC(data)) {
    const mac_ = data.slice(1, 7);
    const mac = macS(mac_);
    const type = [data[7], data[8], data[9]];
    const address = getAddress(rbus, mac, type);
    console.log(mac, address, type);
    if (address >= 0) {
      rbusTransmitDiscovery(rbus, address, mac_);
    } else {
      //TODO error: max number devices on the line
    }
    return;
  }
}
