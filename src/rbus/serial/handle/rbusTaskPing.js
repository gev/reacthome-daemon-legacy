const { RBUS_ADDERSS } = require("../../constants")
const { rbusTransmitPing } = require("./rbusTransmitPing")

module.exports.rbusTaskPing = (rbus) => {
  if (rbus.port.isRBUS && rbus.pool.length === 0) {
    rbusTransmitPing(rbus, RBUS_ADDERSS);
  }
};
