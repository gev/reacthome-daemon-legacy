const {
  RBUS_DATA_PREAMBLE_RECEIVE,
  RBUS_DISCOVERY_PREAMBLE_RECEIVE,
  RBUS_CONFIRM_PREAMBLE_RECEIVE,
  RBUS_PING_PREAMBLE_RECEIVE
} = require("../../constants");
const { handleRbusReceiveConfirm } = require("./handleRbusReceiveConfirm");
const { handleRbusReceiveData } = require("./handleRbusReceiveData");
const { handleRbusReceiveDiscovery } = require("./handleRbusReceiveDiscovery");
const { handleRbusReceivePing } = require("./handleRbusReceivePing");

module.exports.handleRBUS = (rbus, data) => {
  console.log(rbus.index, data);
  const preambula = data[0];
  switch (preambula) {
    case RBUS_DATA_PREAMBLE_RECEIVE:
      handleRbusReceiveData(rbus, data);
      break;
    case RBUS_DISCOVERY_PREAMBLE_RECEIVE:
      handleRbusReceiveDiscovery(rbus, data);
      break;
    case RBUS_CONFIRM_PREAMBLE_RECEIVE:
      handleRbusReceiveConfirm(rbus, data);
      break;
    case RBUS_PING_PREAMBLE_RECEIVE:
      handleRbusReceivePing(rbus, data);
      break;
  }
}
