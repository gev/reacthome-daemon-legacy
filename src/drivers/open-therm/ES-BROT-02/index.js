const { get, set } = require("../../../actions");
const {
  ACTION_SETPOINT,
  ACTION_SET_COOLANT_MIN_TEMP,
  ACTION_SET_COOLANT_MAX_TEMP,
  ACTION_SET_COOLANT_TEMP,
  ACTION_SET_BURNER_MODULATION,
} = require("../../../constants");
const {
  readHoldingRegisters,
  writeRegisters,
} = require("../../modbus");
const {
  READ_HOLDING_REGISTERS,
} = require("../../modbus/constants");
const { ADDRESS, TIMEOUT, REG_W_COOLANT_TEMP, REG_W_COOLANT_MIN_TEMP, REG_W_COOLANT_MAX_TEMP, REG_W_BURNER_MODULATION, REG_R_ADAPTER_STATUS } = require("./constants");

const instance = new Set();

const setBit = (value, numBit) => value | (1 << numBit);
const resetBit = (value, numBit) => value & ~(1 << numBit);

const sync = (id) => {
  const dev = get(id) || {};
  const { bind, synced } = dev;
  if (!bind) return;
  const [modbus, , address] = bind.split("/");
  if (synced) {
    readHoldingRegisters(modbus, address, REG_R_ADAPTER_STATUS, 20);
  } else {
    console.log(dev.coolant_temp, coolant_min_temp, burner_modulation);
    setTimeout(() => {
      writeRegisters(modbus, address, REG_W_COOLANT_TEMP, dev.coolant_temp * 10);
    }, 400);
    setTimeout(() => {
      writeRegisters(modbus, address, REG_W_COOLANT_MIN_TEMP, dev.coolant_min_temp * 10);
    }, 800);
    setTimeout(() => {
      writeRegisters(modbus, address, REG_W_COOLANT_MAX_TEMP, dev.coolant_max_temp * 10);
    }, 1200);
    setTimeout(() => {
      writeRegisters(modbus, address, REG_W_BURNER_MODULATION, dev.burner_modulation);
    }, 1600);
  }
  set(id, { synced: true });
};

module.exports.run = (action) => {
  const { id, type } = action;

  switch (type) {
    case ACTION_SET_COOLANT_TEMP: {
      set(id, { coolant_temp: action.value, synced: false });
      break;
    }
    case ACTION_SET_COOLANT_MIN_TEMP: {
      set(id, { coolant_min_temp: action.value, synced: false });
      break;
    }
    case ACTION_SET_COOLANT_MAX_TEMP: {
      set(id, { coolant_max_temp: action.value, synced: false });
      break;
    }
    case ACTION_SET_BURNER_MODULATION: {
      set(id, { burner_modulation: action.value, synced: false });
      break;
    }
    case ACTION_MODE_HEAT_COOLANT: {
      const dev = get(id) || {};
      const mode = action.value ? setBit(dev.mode, 0) : resetBit(dev.mode, 0);
      set(id, { mode, synced: false });
    }
  }
};

module.exports.handle = (action) => {
  const { id, data } = action;
  console.log(action);
  switch (data[0]) {
    // case READ_HOLDING_REGISTERS:
  }
};

module.exports.clear = () => {
  instance.clear();
};

module.exports.add = (id) => {
  instance.add(id);
};

let index = 0;

setInterval(() => {
  const arr = Array.from(instance);
  if (arr.length > 0) {
    sync(arr[index % arr.length]);
    index++;
  }
}, TIMEOUT);
