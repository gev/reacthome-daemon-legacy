const instances = require("../drivers");

const request = (id, register, data) => {
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
        send(buffer, port, host, handle(id));
    }
}


module.exports.readCoils = (id, register, data) =>
    instances.get(id).readCoils(id, register, data);

module.exports.readInputs = (id, register, data) =>
    instances.get(id).readInputs(id, register, data);

module.exports.readHoldingRegisters = (id, register, data) =>
    instances.get(id).readHoldingRegisters(id, register, data);

module.exports.readInputRegisters = (id, register, data) =>
    instances.get(id).readInputRegisters(id, register, data);

module.exports.writeCoil = (id, register, data) =>
    instances.get(id).writeCoil(id, register, data);

module.exports.writeRegister = (id, register, data) =>
    instances.get(id).writeRegister(id, register, data);

module.exports.writeRegisters = (id, register, data) =>
    instances.get(id).writeRegisters(id, register, data);
