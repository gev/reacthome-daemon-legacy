const { get, set } = require("../../../actions");
const {
  ACTION_SETPOINT,
  ACTION_SET_COOLANT_MIN_TEMP,
  ACTION_SET_COOLANT_MAX_TEMP,
  ACTION_SET_COOLANT_TEMP,
  ACTION_SET_BURNER_MODULATION,
  ACTION_SET_ADDRESS,
  ACTION_SETPOINT_MIN_MAX,
} = require("../../../constants");
const {
  readHoldingRegisters,
  writeRegisters,
  custom,
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
    console.log(dev.coolantTemp, dev.coolantMinTemp, dev.coolantMaxTemp, dev.burnerModulation, dev.newAddress, dev.newAddress);

    if(dev.shouldSetNewAddress){
      custom(modbus, [0x00, 0x47, dev.newAddress]);
      set(id, { shouldSetNewAddress: false });
      return;
    }
    setTimeout(() => {
      writeRegisters(modbus, address, REG_W_COOLANT_TEMP, [dev.coolantTemp * 10]);
    }, 400);
    setTimeout(() => {
      writeRegisters(modbus, address, REG_W_COOLANT_MIN_TEMP, [dev.coolantMinTemp * 10]);
    }, 800);
    setTimeout(() => {
      writeRegisters(modbus, address, REG_W_COOLANT_MAX_TEMP, [dev.coolantMaxTemp * 10]);
    }, 1200);
    setTimeout(() => {
      writeRegisters(modbus, address, REG_W_BURNER_MODULATION, [dev.burnerModulation]);
    }, 1600);
  }
  set(id, { synced: true });
};

module.exports.run = (action) => {
  const { id, type } = action;

  switch (type) {
    case ACTION_SETPOINT: {
      set(id, { coolantTemp: action.value, synced: false });
      break;
    }
    case ACTION_SETPOINT_MIN_MAX: {
      if (action.min <= action.max){
        set(id, { coolantMinTemp: action.min, coolantMaxTemp: action.max, synced: false });
      }
      // set(id, { coolantMinTemp: action.min, coolantMaxTemp: action.min > action.max ? action.min : action.max, synced: false });
      break;
    }
    case ACTION_SET_BURNER_MODULATION: {
      set(id, { burnerModulation: action.value, synced: false });
      break;
    }
    case ACTION_SET_ADDRESS: {
      set(id, {newAddress: action.value, shouldSetNewAddress: true, synced: false })
      break;
    }
    // case ACTION_MODE_HEAT_COOLANT: {
    //   const dev = get(id) || {};
    //   const mode = action.value ? setBit(dev.mode, 0) : resetBit(dev.mode, 0);
    //   set(id, { mode, synced: false });
    // }
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
