const { ACTION_RS485_TRANSMIT } = require("../../../constants");

module.exports.handleRS485 = (rbus, data) => {
  rbus.socket.send([
    ACTION_RS485_TRANSMIT,
    ...data
  ]);
}
