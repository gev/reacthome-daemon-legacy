const { SerialPort } = require('serialport');
const { RBUS_BOUDRATE, RBUS_PARITY } = require('./constants');
const { handle } = require('./hadle');

module.exports.createPort = (rbus, path, isRBUS, baudRate, parity) => {
  if (isRBUS) {
    baudRate = RBUS_BOUDRATE,
      parity = RBUS_PARITY
  }
  const port = new SerialPort({ path, baudRate, parity })
  port.on('data', handle(rbus));
  port.on('drain', () => {
    rbus.rede.write(0);
  });
  rbus.port = {
    path, baudRate, parity, isRBUS,
    send: (data) => {
      rbus.rede.write(1);
      port.write(data);
    },
    close: port.close
  };
}
