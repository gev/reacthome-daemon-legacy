const { RBUS_MESSAGE_SIZE, RBUS_TTL } = require("../../constants");
const { getAddress } = require("../../pool");

let id = 0;

module.exports.handleTransmitRBUS = (rbus, data) => {
  if (!rbus.port.isRBUS) {
    return;
  }
  if (rbus.tx.length >= 64) {
    return
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
  id += 1;
  id %= 256;
  rbus.tx.push({
    address,
    id,
    ttl: RBUS_TTL,
    data: data.slice(7)
  });
}
