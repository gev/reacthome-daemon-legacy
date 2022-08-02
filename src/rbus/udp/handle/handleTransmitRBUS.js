const { RBUS_MESSAGE_SIZE, RBUS_TTL } = require("../../constants");
const { getAddress } = require("../../pool");

module.exports.handleTransmitRBUS = (rbus, data) => {
  if (!rbus.port.isRBUS) {
    return;
  }
  if (data.length < 8) {
    return;
  }
  if (data.length > 7 + RBUS_MESSAGE_SIZE) {
    return;
  }
  const mac = data.slice(1, 7);
  const address = getAddress(rbus, mac);
  if (address < 0) {
    return;
  }
  rbus.tx.push({
    address,
    ttl: RBUS_TTL,
    data: data.slice(7)
  });
}
