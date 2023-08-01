
const { get, set } = require('../../actions');
const { ACTION_ON, ACTION_OFF, ACTION_DALI } = require('../../constants');
const { writeRegister, readHoldingRegisters } = require('../modbus/tcp');
const { READ_HOLDING_REGISTERS } = require('../modbus/constants');
const { delay } = require('../../util');

const instance = new Set();

const sync = async (id) => {
  const dev = get(id) || {};
  // if (modbus && address) {
  //   if (synced) {
  //     readHoldingRegisters(modbus, address, 0x0, 12);
  //   } else {
  //     writeRegister(modbus, address, 0x0, dev.value);
  //     await delay(100);
  //     writeRegister(modbus, address, 0x1, dev.mode);
  //     await delay(100);
  //     writeRegister(modbus, address, 0x2, dev.fan_speed);
  //     await delay(100);
  //     writeRegister(modbus, address, 0x3, dev.direction);
  //     await delay(100);
  //     writeRegister(modbus, address, 0x4, dev.setpoint);
  //     set(id, { synced: true });
  //   }
  // }
};

module.exports.handle = (a) => {
  const { id, kind, index, value } = a;
  set(`${id}/${kind}/${index}`, { value, synced: false })
}


module.exports.clear = () => {
  instance.clear();
}

module.exports.add = (id) => {
  instance.add(id);
};

setInterval(async () => {
  for (const id of instance) {
    await sync(id);
  }
}, 1000);
