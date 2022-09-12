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
      console.log('read nova modbus', modbus, address)
      // readInputRegisters(modbus, address, 0x0, 85);
      readHoldingRegisters(modbus, address, 0x0, 33);
    } else {
      const { value, fan_speed, setpoint } = dev
      console.log('write nova modbus', modbus, address);
      console.log("set", dev.value, dev.fan_speed);
      writeRegister(modbus, address, 0x2, value ? 1 : 0);
      await delay(300);
      writeRegister(modbus, address, 0x20, fan_speed);
      await delay(300);
      writeRegister(modbus, address, 0x1f, setpoint);
      setTimeout(() => {

      }, 500);
    }
    // writeRegister(modbus, address, 0x1, dev.setpoint * 10);
    set(id, { synced: true });
  }

};

let d = [];

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
      console.log('handle nova modbus', id);
      for (let i = 1; i <= 33; i++) {
        const x = data.readUInt16BE(i * 2);
        if (d[i] !== x) console.log(i, x);
        d[i] = x;
      }
      switch (data[0]) {
        case READ_HOLDING_REGISTERS: {
          const dev = get(id) || {};
          const value = data.readUInt16BE(6) & 0x1;
          const fan_speed = data.readUInt16BE(66);
          const setpoint = data.readUInt16BE(64) / 10;
          console.log("get", value, fan_speed, setpoint);
          if (dev.synced) {
            set(id, {
              value,
              fan_speed,
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
          const setpoint = data.readUInt16BE(50) / 10;
          console.log("get", value, fan_speed, setpoint);
          if (dev.synced) {
            set(id, {
              value,
              fan_speed,
              setpoint,
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
