const { RBUS_ADDERSS } = require("../../constants")
const { rbusTransmitPing } = require("./rbusTransmitPing")

module.exports.rbusTransmit = (rbus) => {
  console.log(rbus.inndex, rbus.pool)
  if (rbus.pool.length === 0) {
    rbusTransmitPing(rbus, RBUS_ADDERSS);
  }
};
