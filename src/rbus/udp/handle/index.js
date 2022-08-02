const { ACTION_INITIALIZE, ACTION_RS485_MODE } = require("../../../constants");
const { handleInit } = require("./handleInit");
const { handleRS485Mode } = require("./handleRS485Mode");

module.exports.handle = (rbus) => (data, info) => {
  console.log(rbus.index, data, info);
  const action = data[0];
  switch (action) {
    case ACTION_INITIALIZE:
      handleInit(rbus, data);
      break;
    case ACTION_RS485_MODE:
      handleRS485Mode(rbus, data);
      break;
  }
}
