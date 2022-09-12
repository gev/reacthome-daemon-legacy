const { get, set } = require("../../../actions");
const {
  ACTION_SET_FAN_SPEED,
  ACTION_ON,
  ACTION_OFF,
  ACTION_SETPOINT,
} = require("../../../constants");
const {
  writeRegister,
  readHoldingRegisters,
  writeRegisters,
  readInputRegisters,
} = require("../../modbus/rbus");
const {
  READ_HOLDING_REGISTERS,
  WRITE_REGISTER,
  READ_INPUT_REGISTERS,
} = require("../../modbus/constants");
const { ADDRESS, TIMEOUT } = require("./constants");
const { delay } = require("../../../util");

const instance = new Set();

const sync = async (id) => {
  const dev = get(id) || {};
  const { bind, synced } = dev;
  const [modbus, , address] = bind.split("/");
  if (modbus) {
    if (synced) {
      readInputRegisters(modbus, address, 0x0, 85);
      await delay(300);
      readHoldingRegisters(modbus, address, 0x1f, 1);
    } else {
      const { value, fan_speed, setpoint } = dev
      writeRegister(modbus, address, 0x2, value ? 1 : 0);
      await delay(300);
      writeRegister(modbus, address, 0x20, fan_speed);
      await delay(300);
      writeRegister(modbus, address, 0x1f, setpoint * 10);
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
      set(id, { fan_speed: action.value, synced: false });
      break;
    }
    case ACTION_SETPOINT: {
      set(id, { setpoint: action.value, synced: false });
      break;
    }
    default: {
      const { id, data } = action;
      switch (data[0]) {
        case READ_HOLDING_REGISTERS: {
          const dev = get(id) || {};
          const setpoint = data.readUInt16BE(2) / 10;
          if (dev.synced) {
            set(id, {
              setpoint,
              synced: true,
            });
          }
          break;
        }
        case READ_INPUT_REGISTERS: {
          const dev = get(id) || {};
          const value = data.readUInt16BE(6) & 0x1;
          const fan_speed = data.readUInt16BE(52);
          if (dev.synced) {
            set(id, {
              value,
              fan_speed,
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
