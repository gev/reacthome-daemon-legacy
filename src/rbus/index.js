const dgram = require('dgram');
const { SerialPort } = require('serialport')

const { DEVICE_PORT, DEVICE_GROUP } = require('../constants');

const RBUS_BOUDRATE = 1_000_000;
const RBUS_PARITY = 'none';

const handleSocket = (rbus) => (data, info) => {
  console.log(data, info);
}

createSocket = (rbus) => {
  const socket = dgram.createSocket('udp4');
  socket.bind(DEVICE_PORT, rbus.host, () => {
    socket.addMembership(DEVICE_GROUP);
  });
  socket.on('meaasge', handleSocket(rbus));
  return socket;
}

const handlePort = (rbus) => (data) => {
  console.log(data);
}

createPort = (rbus, path, baudRate, parity, isRBUS, rede) => {
  const port = new SerialPort({ path, baudRate, parity })
  port.on('data', handlePort(rbus));
  port.on('');
  return {
    path, baudRate, parity, isRBUS, rede,
    send: port.send
  };
}

export default (host, path, rede) => {
  const rbus = {
    socket: createSocket(rbus, host),
    port: createPort(rbus, path, RBUS_BOUDRATE, RBUS_PARITY, True, rede),
  };
}