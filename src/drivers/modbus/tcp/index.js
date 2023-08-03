
const net = require('net');
const { get } = require('../../../actions');
const {
  READ_INPUT_REGISTERS,
  READ_HOLDING_REGISTERS,
  WRITE_REGISTER,
  WRITE_REGISTERS,
  MODBUS,
  READ_COILS,
  READ_INPUTS,
  WRITE_COIL,
} = require('../constants');
const driver = require('../../driver');

const sockets = new Map();

const connect = (host, port) => new Promise((resolve, reject) => {
  const socket = net.connect({ host, port }, () => {
    resolve(socket);
  });
  socket.on('error', err => {
    socket.destroy();
    reject(err);
  });
  socket.on('data', handle);
});

const send = async (data, port, host) => {
  try {
    const id = `${host}:${port}`;
    let socket;
    if (sockets.has(id)) {
      socket = sockets.get(id)
    } else {
      socket = await connect(host, port);
      sockets.set(id, socket);
    }
    await socket.write(data);
  } catch (e) {
    console.error(e);
  }
}

let tid = 0;

const request = (getSize, fill) => (code) => (id, register, data) => {
  const { host, port, address } = get(id) || {};
  if (host && port) {
    tid = (tid + 1) % 0xffff;
    const size = getSize(data);
    const buffer = Buffer.alloc(size);
    buffer.writeUInt16BE(tid, 0);
    buffer.writeUInt16BE(0, 2);
    buffer.writeUInt16BE(size - 6, 4);
    buffer.writeUInt8(address, 6);
    buffer.writeUInt8(code, 7);
    buffer.writeUInt16BE(register, 8);
    fill(buffer, data);
    send(buffer, port, host);
  }
}

const request12 = request(
  () => 12,
  (buffer, data) => {
    buffer.writeUInt16BE(data, 10);
  }
);

module.exports.readCoils = request12(READ_COILS);
module.exports.readInputs = request12(READ_INPUTS);
module.exports.readHoldingRegisters = request12(READ_HOLDING_REGISTERS);
module.exports.readInputRegisters = request12(READ_INPUT_REGISTERS);
module.exports.writeCoil = request12(WRITE_COIL);
module.exports.writeRegister = request12(WRITE_REGISTER);
module.exports.writeRegisters = request(
  (data) => 13 + 2 * data.length,
  (buffer, data) => {
    buffer.writeUInt16BE(data.length, 10);
    buffer.writeUInt8(2 * data.length, 12);
    for (let i = 0; i < data.length; i++) {
      buffer.writeUInt16BE(data[i], 2 * i + 13);
    }
  }
)(WRITE_REGISTERS);

const handle = ({ id, data }) => {
  console.log(data);
  const address = data[0];
  const { bind } = get(`${id}/${MODBUS}/${address}`) || {};
  if (bind) {
    driver.handle({ id: bind, data: data.slice(1) });
  }
};

module.exports.handle = handle;

module.exports.run = () => { };
