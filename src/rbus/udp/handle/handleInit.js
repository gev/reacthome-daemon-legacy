const { ACTION_INITIALIZED } = require("../../../constants");
const { rbusTaskTransmit } = require("../../serial/handle/rbusTaskTransmit");
const { rbusTaskPing } = require("../../serial/handle/rbusTaskPing");

module.exports.handleInit = (rbus, data) => {
  const isRbus = data.readUint8(0);
  const baudRate = data.readUint32LE(1);
  const lineControl = data.readUint8(5);
  rbus.port.reCreate(isRbus, baudRate, lineControl);
  rbus.socket.send([ACTION_INITIALIZED]);
  setInterval(rbusTaskTransmit, 3, rbus);
  setInterval(rbusTaskPing, 1000, rbus);
  rbus.ready = true;
}