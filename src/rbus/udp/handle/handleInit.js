const { ACTION_INITIALIZED } = require("../../../constants");

module.exports.handleInit = (rbus, data) => {
  const isRbus = data.readUint8(0);
  const baudRate = data.readUint32LE(1);
  const lineControl = data.readUint8(5);
  rbus.port.reCreate(isRbus, baudRate, lineControl);
  rbus.socket.send([ACTION_INITIALIZED]);
}