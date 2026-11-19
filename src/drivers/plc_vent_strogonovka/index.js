const { get, set } = require("../../actions");
const {
  ACTION_SET_FAN_SPEED,
  ACTION_SETPOINT,
} = require("../../constants");
const { writeRegister, readInputRegisters } = require("../modbus");
const { READ_INPUT_REGISTERS } = require("../modbus/constants");
const { delay } = require("../../util");
const {
  TIMEOUT,
  CHANNELS_DEFAULT,
  SETPOINT_MIN,
  SETPOINT_MAX,
  SPEED_MIN,
  SPEED_MAX,
  READ_START,
  READ_COUNT,
  REG_SPEED,
  REG_TEMPERATURE,
  REG_ERROR,
  REG_ERROR_DRIVE,
  REG_ERROR_DAMPER,
  WRITE_SPEED,
  WRITE_TEMPERATURE,
} = require("./constants");

const instance = new Map();

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const parseBind = (id) => {
  const { bind = "", numberAC = CHANNELS_DEFAULT } = get(id) || {};
  const [modbus, , address] = bind.split("/");
  return { modbus, address: Number(address), numberAC };
};

// write all unsynchronized channels, then read the state of all channels
const sync = async (id) => {
  const { modbus, address, numberAC } = parseBind(id);
  if (!modbus) return;
  for (let i = 0; i < numberAC; i += 1) {
    const ch = `${id}/ac/${i + 1}`;
    const { synced, fan_speed, setpoint } = get(ch) || {};
    if (synced === false) {
      if (fan_speed !== undefined) {
        writeRegister(modbus, address, WRITE_SPEED(i), fan_speed);
        await delay(300);
      }
      if (setpoint !== undefined) {
        writeRegister(modbus, address, WRITE_TEMPERATURE(i), setpoint);
        await delay(300);
      }
      set(ch, { synced: true });
    }
  }
  readInputRegisters(modbus, address, READ_START, READ_COUNT);
};

const loop = (id) => async () => {
  try {
    if (!get(id)) {
      instance.delete(id);
      return;
    }
    await sync(id);
  } catch (e) {
    console.error(e);
  }
  instance.set(id, setTimeout(loop(id), TIMEOUT));
};

module.exports.run = (action) => {
  const { id, type, index } = action;
  const ch = `${id}/ac/${index}`;
  switch (type) {
    case ACTION_SET_FAN_SPEED: {
      const speed = clamp(Number(action.value), SPEED_MIN, SPEED_MAX);
      if (!Number.isNaN(speed)) {
        set(ch, { fan_speed: speed, synced: false });
      }
      break;
    }
    case ACTION_SETPOINT: {
      const setpoint = clamp(Number(action.value), SETPOINT_MIN, SETPOINT_MAX);
      if (!Number.isNaN(setpoint)) {
        set(ch, { setpoint, synced: false });
      }
      break;
    }
  }
};

module.exports.handle = (action) => {
  const { id, data } = action;
  if (data[0] !== READ_INPUT_REGISTERS) return;
  const reg = (n) => {
    const offset = 2 + 2 * (n - READ_START);
    return offset + 2 <= data.length ? data.readUInt16BE(offset) : undefined;
  };
  const { numberAC } = parseBind(id);
  for (let i = 0; i < numberAC; i += 1) {
    const ch = `${id}/ac/${i + 1}`;
    const dev = get(ch) || {};
    // do not overwrite a pending command
    if (dev.synced === false) continue;
    const speed = reg(REG_SPEED(i));
    const temperature = reg(REG_TEMPERATURE(i));
    const state = {
      error: reg(REG_ERROR(i)),
      damper_error: reg(REG_ERROR_DAMPER(i)),
      drive_error: reg(REG_ERROR_DRIVE),
      synced: true,
    };
    if (speed !== undefined) state.fan_speed = speed;
    if (temperature !== undefined) state.temperature = temperature;
    set(ch, state);
  }
};

module.exports.clear = () => {
  for (const timer of instance.values()) {
    clearTimeout(timer);
  }
  instance.clear();
};

module.exports.add = (id) => {
  if (instance.has(id)) {
    clearTimeout(instance.get(id));
  }
  instance.set(id, setTimeout(loop(id), 100));
};
