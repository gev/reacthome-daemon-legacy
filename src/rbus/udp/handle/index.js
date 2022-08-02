const { handleInit } = require("./handleInit");
const { handleRS485Mode } = require("./handleRS485Mode");
const { handleTransmitRBUS } = require("./handleTransmitRBUS");
const { handleTransmitRS485 } = require("./handleTransmitRS485");
const {
  ACTION_INITIALIZE,
  ACTION_RS485_MODE,
  ACTION_RBUS_TRANSMIT,
  ACTION_RS485_TRANSMIT
} = require("../../../constants");

module.exports.handle = (rbus) => (data, info) => {
  const action = data[0];
  switch (action) {
    case ACTION_INITIALIZE:
      handleInit(rbus, data);
      break;
    case ACTION_RS485_MODE:
      handleRS485Mode(rbus, data);
      break;
    case ACTION_RBUS_TRANSMIT:
      handleTransmitRBUS(rbus, data);
    case ACTION_RS485_TRANSMIT:
      handleTransmitRS485(rbus, data);
  }
}
