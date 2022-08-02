const { ACTION_RS485_MODE } = require("../../../constants");

module.exports.handleRS485Mode = (rbus, data) => {
  const index = data.readUint8(1);
  if (index !== 1) return;
  const isRBUS = data.readUint8(2);
  const baudRate = data.readUint32LE(3);
  const lineControl = data.readUint8(7);
  rbus.port.reCreate(isRBUS, baudRate, lineControl);
  const buffer = Buffer.alloc(8);
  buffer[0] = ACTION_RS485_MODE;
  buffer[1] = 1;
  buffer[2] = rbus.port.isRBUS;
  buffer.writeUInt32LE(rbus.port.baudRate, 3);
  buffer[7] = rbus.port.lineControl;
  rbus.socket.send(buffer);
  rbus.pool = [];
  rbus.rx = [];
  rbus.tx = [];
}