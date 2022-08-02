const { RBUS_DISCOVERY_RX_BUFFER_SIZE } = require("../../constants");
const { checkCRC } = require("../../crc");
const { macS } = require("../../mac");
const { getAddress } = require("../../pool");

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
    // rbus_device_type_t * type = (rbus_device_type_t *)(buffer + RBUS_DISCOVERY_HEADER_SIZE + sizeof(mac_t));
    //     int16_t address = rbus_mac_table_add_mac(& (rbus -> mac_table), mac, type);
    // if (address >= 0)
    //   rbus_transmit_discovery(rbus, address, mac);
  }
  else {
    //TODO error: max number devices on the line
  }
  return;
}
