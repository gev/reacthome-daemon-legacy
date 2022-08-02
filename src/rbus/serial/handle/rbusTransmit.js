const { RBUS_ADDERSS } = require("../../constants")
const { rbusTransmitPing } = require("./rbusTransmitPing")

module.exports.rbusTransmit = (rbus) => () => {
  if (rbus.pool.length === 0) {
    rbusTransmitPing(RBUS_ADDERSS);
  }
}