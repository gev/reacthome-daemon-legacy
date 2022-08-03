const { handleRBUS } = require("./handleRBUS");
const { handleRS485 } = require("./handleRS485");

module.exports.handle = (rbus) => (data) => {
  if (rbus.port.isRBUS) {
    handleRBUS(rbus, data);
  } else {
    handleRS485(rbus, data)
  }
}
