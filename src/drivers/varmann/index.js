
const { get, set } = require('../../actions');
const { ACTION_SET_ADDRESS, ACTION_SET_FAN_SPEED } = require('../../constants');
const { writeRegister, readHoldingRegisters } = require('../modbus/rbus');
const { READ_HOLDING_REGISTERS, WRITE_REGISTER } = require('../modbus/constants');
const { BROADCAST_ADDRESS, TIMEOUT } = require('./constants');

const instance = new Set();

const sync = (id) => {
  const dev = get(id) || {};
  const {bind, synced} = dev;
  const [modbus,, address] = (bind || '').split('/');
  if (modbus && address) {
    if (synced) {
      readHoldingRegisters(modbus, address, 0x0, 25);
    } else {
      if (dev.broadcast) {
        writeRegister(modbus, BROADCAST_ADDRESS, 0x0, dev.address);
        set(id, {synced: true, broadcast: false});
      } else {
        writeRegister(modbus, address, 0x6, dev.fan_speed);
        set(id, {synced: true});
      }
    }
  }
};

module.exports.handle = (action) => {
  const {id, type} = action;
  switch (type) {
    case ACTION_SET_ADDRESS: {
      set(id, {address: action.value, synced: false, broadcast: true})
      break;
    }
    case ACTION_SET_FAN_SPEED: {
      set(id, {fan_speed: action.value, synced: false});
      break;
    }
    default: {
      const {data} = action;
      switch (data[0]) {
        // case WRITE_REGISTER: {
        //   set(id, {synced: true});
        //   break;
        // }
        case READ_HOLDING_REGISTERS: {
          const dev = get(id) || {};
          if (dev.synced) {
            set(id, {fan_speed: data.readUInt16BE(14), synced: true})
          } 
          break;
        }
      }
    }
  }
};

module.exports.clear = () => {
  instance.clear();
}

module.exports.add = (id) => {
  instance.add(id);
};

setInterval(() => {
  let i = 0;
  for (const id of instance) {
    setTimeout(() => {
      sync(id);
    }, i * 100);
    i += 1;
  }
}, TIMEOUT);