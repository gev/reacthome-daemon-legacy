const { handleRBUS } = require("./handleRBUS");
const { handleRS485 } = require("./handleRS485");

module.exports.handle = (rbus) => (data) => {
  console.log(rbus.index, data);
  if (rbus.isRBUS) {
    handleRBUS(rbus, data);
  } else {
    handleRS485(rbus, data)
  }
}
