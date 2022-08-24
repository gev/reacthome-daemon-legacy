const { get, set } = require("../../actions");
const {
  ACTION_SET_FAN_SPEED,
  ACTION_ON,
  ACTION_OFF,
  ACTION_SETPOINT,
} = require("../../constants");
const {
  writeRegister,
  readHoldingRegisters,
  writeRegisters,
  readInputRegisters,
} = require("../modbus/rbus");
const {
  READ_HOLDING_REGISTERS,
  WRITE_REGISTER,
} = require("../modbus/constants");
const { ADDRESS, TIMEOUT } = require("./constants");

const instance = new Set();

const sync = (id) => {
  const dev = get(id) || {};
  const { bind, synced } = dev;
  const [modbus, , address] = bind.split("/");
  if (modbus) {
    if (synced) {
      console.log('read modbus value')
      readInputRegisters(modbus, address, 0x2, 1);
    } else {
      console.log('write modbus value');
      writeRegister(modbus, address, 0x2, dev.value ? 1 : 0);
      setTimeout(() => {
        console.log('write modbus fan_speed');
        writeRegister(modbus, address, 0x19, dev.fan_speed);
      }, 100);
    }
    // writeRegister(modbus, address, 0x1, dev.setpoint * 10);
    set(id, { synced: true });
  }

};

module.exports.handle = (action) => {
  const { id, type } = action;
  switch (type) {
    case ACTION_ON: {
      set(id, { value: true, synced: false });
      break;
    }
    case ACTION_OFF: {
      set(id, { value: false, synced: false });
      break;
    }
    case ACTION_SET_FAN_SPEED: {
      set(id, {
        fan_speed: action.value,
        value: !!action.value,
        synced: false,
      });
      break;
    }
    case ACTION_SETPOINT: {
      set(id, { setpoint: action.value, synced: false });
      break;
    }
    default: {
      const { data } = action;
      console.log('modbus receive: ', data);
      switch (data[0]) {
        case READ_HOLDING_REGISTERS: {
          const dev = get(id) || {};
          // const value = data.readUInt16BE(2);
          // const fan_speed = data.readUInt16BE(2);
          // const setpoint = data.readUInt16BE(4) / 10;
          // if (dev.synced) {
          // set(id, {
          // value,// !!fan_speed,
          // fan_speed: fan_speed ? fan_speed : dev.fan_speed,
          // setpoint,
          // synced: true,
          // });
        }
          break;
      }
    }
  }
};

module.exports.clear = () => {
  instance.clear();
};

module.exports.add = (id) => {
  instance.add(id);
};

setInterval(() => {
  for (const id of instance) {
    sync(id);
  }
}, TIMEOUT);
