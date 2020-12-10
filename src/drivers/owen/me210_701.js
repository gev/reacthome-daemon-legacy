const { readHoldingRegisters } = require("../modbus/tcp");



modules.exports.add = (id) => {

}

readHoldingRegisters('172.16.1.1', 502, 1, 0x14D8, 2);
