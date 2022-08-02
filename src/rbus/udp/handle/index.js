const { ACTION_INITIALIZE, ACTION_RS485_MODE } = require("../../../constants");
const { init } = require("./init");
const { rs485Mode } = require("./rs485Mode");

module.exports.handle = (rbus) => (data, info) => {
  console.log(rbus.index, data, info);
  const action = data[0];
  switch (action) {
    case ACTION_INITIALIZE:
      init(rbus, data);
      break;
    case ACTION_RS485_MODE:
      rs485Mode(rbus, data);
      break;
  }
}
