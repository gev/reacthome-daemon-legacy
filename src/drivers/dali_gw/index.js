
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
  console.log(action);
  // const { id, type, action, value } = action;
  // if (type === ACTION_DALI) {
  //   switch (type) {
  //     case ACTION_ON: {
  //       set(id, { value, synced: false });
  //       break;
  //     }
  //     case ACTION_OFF: {
  //       set(id, { value: false, synced: false });
  //       break;
  //     }
  //     case ACTION_SET_DIRECTION: {
  //       set(id, { direction: action.value, synced: false });
  //       break;
  //     }
  //     case ACTION_SETPOINT: {
  //       set(id, { setpoint: action.value, synced: false });
  //       break;
  //     }
  //     default: {
  //       const { id, data } = action;
  //       switch (data[0]) {
  //         case READ_HOLDING_REGISTERS: {
  //           const dev = get(id) || {};
  //           if (dev.synced) {
  //             set(id, {
  //               value: data.readUInt16BE(2),
  //               mode: data.readUInt16BE(4),
  //               fan_speed: data.readUInt16BE(6),
  //               direction: data.readUInt16BE(8),
  //               setpoint: data.readUInt16BE(10),
  //               synced: true
  //             })
  //           }
  //           break;
  //         }
  //       }
  //     }
  //   }
  // }

};

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
