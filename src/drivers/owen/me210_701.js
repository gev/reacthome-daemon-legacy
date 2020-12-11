const { readHoldingRegisters } = require("../modbus/tcp");



module.exports.add = (id) => {

}

readHoldingRegisters('172.16.1.1', 502, 1, 5336, 2);
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 6; j++) {
    readHoldingRegisters('172.16.1.1', 502, 1, 5240 + i * 2 + j * 12, 2);
  }
}
