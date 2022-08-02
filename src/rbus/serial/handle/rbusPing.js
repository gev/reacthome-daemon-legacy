const { RBUS_ADDERSS } = require("../../constants")
const { rbusTransmitPing } = require("./rbusTransmitPing")

module.exports.rbusPing = (rbus) => {
  if (rbus.pool.length === 0) {
    rbusTransmitPing(rbus, RBUS_ADDERSS);
  }
};
