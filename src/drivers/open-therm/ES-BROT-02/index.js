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
  readInputRegisters,
} = require("../../modbus");
const {
  READ_HOLDING_REGISTERS,
  WRITE_REGISTERS,
  READ_INPUT_REGISTERS,
} = require("../../modbus/constants");
const { ADDRESS, TIMEOUT, REG_W_COOLANT_TEMP, REG_W_COOLANT_MIN_TEMP, REG_W_COOLANT_MAX_TEMP, REG_W_BURNER_MODULATION, REG_R_ADAPTER_STATUS, REG_R_COOLANT_MIN_TEMP, REG_R_COOLANT_MAX_TEMP, REG_R_DHW_MIN_TEMP, REG_R_DHW_MAX_TEMP, REG_R_CURRENT_PRESSURE, REG_R_ERROR_CODE_MAIN, REG_R_BURNER_MODULATION, REG_R_ERROR_CODE_ADD, REG_R_OPENTHERM_ERRORS, REG_R_ADAPTER_UPTIME, REG_R_COOLANT_TEMP, REG_R_DHW_TEMP, REG_R_CURRENT_VOLUME_FLOW_RATE, REG_R_BURNER_STATUS, REG_R_OUTER_TEMP, REG_R_VENDOR_CODE, REG_R_MODEL_CODE, REG_W_MODE, REG_W_CONNECT_TYPE } = require("./constants");

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
    setTimeout(() => {
      readInputRegisters(modbus, address, 0x0081, 1);
    }, 400);
  } else {
    console.log(dev.coolantTemp, dev.coolantMinTemp, dev.coolantMaxTemp, dev.burnerModulation, dev.newAddress);

    if (dev.shouldSetNewAddress) {
      custom(modbus, [0x00, 0x47, dev.newAddress]);
      set(id, { shouldSetNewAddress: false });
      return;
    }

    writeRegisters(modbus, address, REG_W_MODE, [0x01]);
    // setTimeout(() => {
    //   writeRegisters(modbus, address, REG_W_CONNECT_TYPE, [0]);
    // }, 200);
    setTimeout(() => {
      writeRegisters(modbus, address, REG_W_COOLANT_TEMP, [dev.coolantTemp * 10]);
    }, 400);
    setTimeout(() => {
      writeRegisters(modbus, address, REG_W_COOLANT_MIN_TEMP, [dev.coolantMinTemp]);
    }, 800);
    setTimeout(() => {
      writeRegisters(modbus, address, REG_W_COOLANT_MAX_TEMP, [dev.coolantMaxTemp]);
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
      if (action.min <= action.max) {
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
      set(id, { newAddress: action.value, shouldSetNewAddress: true, synced: false })
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
  const offsetBufReg = (reg) => (reg - REG_R_ADAPTER_STATUS) * 2 + 2;
  const { id, data } = action;
  switch (data[0]) {
    case READ_HOLDING_REGISTERS: {
      const statusAdapter = data.readUInt16BE(offsetBufReg(REG_R_ADAPTER_STATUS));
      const uptimeAdapter = data.readUInt32BE(offsetBufReg(REG_R_ADAPTER_UPTIME));
      const coolantTemp = data.readUInt16BE(offsetBufReg(REG_R_COOLANT_TEMP));
      const coolantMinTemp = data.readUInt16BE(offsetBufReg(REG_R_COOLANT_MIN_TEMP));
      const coolantMaxTemp = data.readUInt16BE(offsetBufReg(REG_R_COOLANT_MAX_TEMP));
      const DHWTemp = data.readUInt16BE(offsetBufReg(REG_R_DHW_TEMP));
      const DHWMinTemp = data.readUInt16BE(offsetBufReg(REG_R_DHW_MIN_TEMP));
      const DHWMaxTemp = data.readUInt16BE(offsetBufReg(REG_R_DHW_MAX_TEMP));
      const currentPressure = data.readUInt16BE(offsetBufReg(REG_R_CURRENT_PRESSURE));
      const currentVolumeFlowRate = data.readUInt16BE(offsetBufReg(REG_R_CURRENT_VOLUME_FLOW_RATE));
      const burnerModulation = data.readUInt16BE(offsetBufReg(REG_R_BURNER_MODULATION));
      const burnerStatus = data.readUInt16BE(offsetBufReg(REG_R_BURNER_STATUS));
      const errorMainCode = data.readUInt16BE(offsetBufReg(REG_R_ERROR_CODE_MAIN));
      const errorAddCode = data.readUInt16BE(offsetBufReg(REG_R_ERROR_CODE_ADD));
      const outerTemp = data.readUInt16BE(offsetBufReg(REG_R_OUTER_TEMP));
      const vendorCode = data.readUInt16BE(offsetBufReg(REG_R_VENDOR_CODE));
      const modelCode = data.readUInt16BE(offsetBufReg(REG_R_MODEL_CODE));
      const errorOpenTherm = data.readUInt16BE(offsetBufReg(REG_R_OPENTHERM_ERRORS));
      console.log(
        "\n statusAdapter:", statusAdapter.toString(2),
        "\n uptimeAdapter:", uptimeAdapter,
        "\n coolantTemp:", coolantTemp,
        "\n coolantMinTemp:", coolantMinTemp,
        "\n coolantMaxTemp:", coolantMaxTemp,
        "\n DHWTemp:", DHWTemp,
        "\n DHWMinTemp:", DHWMinTemp,
        "\n DHWMaxTemp:", DHWMaxTemp,
        "\n currentPressure:", currentPressure,
        "\n currentVolumeFlowRate:", currentVolumeFlowRate,
        "\n burnerModulation:", burnerModulation,
        "\n burnerStatus:", burnerStatus.toString(2),
        "\n errorMainCode:", errorMainCode,
        "\n errorAddCode:", errorAddCode,
        "\n outerTemp:", outerTemp,
        "\n vendorCode:", vendorCode,
        "\n modelCode:", modelCode,
        "\n errorOpenTherm:", errorOpenTherm,
      );
      break;
    }
    case READ_INPUT_REGISTERS: {
      stateAdapter = data.readInt16BE(2);
      console.log("\n stateAdapter:", stateAdapter);
    }
    case WRITE_REGISTERS:{
      // console.log("return write registers:", data);
    }
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
