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
} = require("../modbus/rbus");
const {
  READ_HOLDING_REGISTERS,
  WRITE_REGISTER,
} = require("../modbus/constants");
const { ADDRESS, TIMEOUT } = require("./constants");

const instance = new Set();

const sync = (id) => {
  const dev = get(id) || {};
  console.log(id, dev);
  const { bind, synced } = dev;
  const [modbus, , address] = bind.split("/");
  if (modbus) {
    if (synced) {
      console.log("read");
      readHoldingRegisters(modbus, address, 1, 1);
    } else {
      console.log("write", dev);
      writeRegister(modbus, address, 0x0, dev.value ? dev.fan_speed : 0);
      writeRegister(modbus, address, 0x1, dev.setpoint * 10);
      // set(id, { synced: true });
    }
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
      console.log(data);
      switch (data[0]) {
        case READ_HOLDING_REGISTERS: {
          const dev = get(id) || {};
          const fan_speed = data.readUInt16BE(2);
          // const setpoint = data.readUInt16BE(4) / 10;
          if (dev.synced) {
            set(id, {
              value: !!fan_speed,
              fan_speed: fan_speed ? fan_speed : dev.fan_speed,
              // setpoint,
              synced: true,
            });
          }
          break;
        }
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
