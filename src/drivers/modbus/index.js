const instances = require("../drivers");

module.exports.readCoils = (id, address, register, data) =>
    instances.get(id).readCoils(id, address, register, data);

module.exports.readInputs = (id, address, register, data) =>
    instances.get(id).readInputs(id, address, register, data);

module.exports.readHoldingRegisters = (id, address, register, data) =>
    instances.get(id).readHoldingRegisters(id, address, register, data);

module.exports.readInputRegisters = (id, address, register, data) =>
    instances.get(id).readInputRegisters(id, address, register, data);

module.exports.writeCoil = (id, address, register, data) =>
    instances.get(id).writeCoil(id, address, register, data);

module.exports.writeRegister = (id, address, register, data) =>
    instances.get(id).writeRegister(id, address, register, data);

module.exports.writeRegisters = (id, address, register, data) =>
    instances.get(id).writeRegisters(id, address, register, data);
