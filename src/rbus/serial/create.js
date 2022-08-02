const { SerialPort } = require('serialport');
const { RBUS_BOUDRATE, RBUS_LINE_CONTROL, RBUS_LINE_CONTROLS } = require('./constants');
const { handle } = require('./hadle');

const createPort = (rbus, path, isRBUS, baudRate, lineControl) => {
  baudRate = baudRate || RBUS_BOUDRATE
  lineControl = lineControl || RBUS_LINE_CONTROL
  isRBUS = !!isRBUS;
  const port = new SerialPort(
    isRBUS
      ? { path, ...RBUS_LINE_CONTROLS[lineControl], baudRate: RBUS_BOUDRATE }
      : { path, ...RBUS_LINE_CONTROLS[lineControl], baudRate }
  )
  port.on('data', handle(rbus));
  port.on('drain', () => {
    rbus.rede.write(0);
  });
  rbus.port = {
    path, baudRate, lineControl, isRBUS,
    send: (data) => {
      rbus.rede.write(1);
      port.write(data);
    },
    close: port.close,
    reCreate: (isRBUS, baudRate, lineControl) => {
      port.close();
      createPort(rbus, path, isRBUS, baudRate, lineControl);
    }
  };
}

module.exports.createPort = createPort;