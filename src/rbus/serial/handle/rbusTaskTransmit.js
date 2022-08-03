const { RBUS_DATA_PREAMBLE_TRANSMIT } = require("../../constants")

module.exports.rbusTaskTransmit = (rbus) => {
  if (!rbus.port.isRBUS) {
    return;
  }
  if (rbus.tx.length === 0) {
    return;
  }
  const item = rbus.tx[0];
  if (item.ttl > 0) {
    item.ttl--;
    rbus.port.sendRBUS([
      RBUS_DATA_PREAMBLE_TRANSMIT,
      item.address,
      item.id,
      item.data.size,
      ...item.data
    ])
  } else {
    rbus.tx.shift();
  }
};
