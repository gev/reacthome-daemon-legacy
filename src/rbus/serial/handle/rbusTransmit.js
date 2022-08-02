const { RBUS_ADDERSS } = require("../../constants")
const { rbusTransmitPing } = require("./rbusTransmitPing")

module.exports.rbusTransmit = (rbus) => {
  console.log(rbus.index, rbus.pool, rbus.pool.length)
  if (rbus.pool.length === 0) {
    rbusTransmitPing(rbus, RBUS_ADDERSS);
  }
};
