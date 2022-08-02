const { RBUS_DISCOVERY_RX_BUFFER_SIZE } = require("../../constants");
const { checkCRC } = require("../../crc");

module.exports.handleRbusReceiveDiscovery = (rbus, data) => {
  console.log(rbus.index, data, checkCRC(data));
  // if (data.length < RBUS_DISCOVERY_RX_BUFFER_SIZE) {
  //   return;
  // }
  // if (rbus_check_crc16(buffer, RBUS_DISCOVERY_HEADER_SIZE + sizeof(mac_t) + sizeof(rbus_device_type_t))) {
  //   mac_t * mac = (mac_t *)(buffer + RBUS_DISCOVERY_HEADER_SIZE);
  //   rbus_device_type_t * type = (rbus_device_type_t *)(buffer + RBUS_DISCOVERY_HEADER_SIZE + sizeof(mac_t));
  //       int16_t address = rbus_mac_table_add_mac(& (rbus -> mac_table), mac, type);
  //   if (address >= 0) {
  //     rbus_transmit_discovery(rbus, address, mac);
  //   }
  //   else {
  //     //TODO error: max number devices on the line
  //   }
  //   return;
  // }

}
