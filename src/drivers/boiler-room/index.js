const { get, set } = require("../../actions");
const service = require("../../controllers/service");
const {
  ACTION_SCRIPT_RUN,
  DHW,
  HEATING,
  TEMPERATURE,
} = require("../../constants");
const {
  TIMEOUT,
  BOILER_MODE,
  DHW_COOLANT_TEMP,
  DHW_SENSOR_DOMESTIC,
  DHW_HYSTERESIS_DOMESTIC,
  DHW_ON_START_HEAT_DOMESTIC,
  DHW_ON_STOP_HEAT_DOMESTIC,
  HEATING_ON_STOP_HEAT,
  HYSTERESIS_DEFAULT,
  CURVE_FIXED,
  CURVE_SETPOINT_MIN,
  CURVE_SETPOINT_MAX,
} = require("./constants");

const instance = new Map();

const isNumber = (v) => typeof v === "number" && !Number.isNaN(v);

const line = (outdoor, coolant) => {
  if (!isNumber(outdoor) || !isNumber(coolant) || outdoor === CURVE_FIXED) {
    return null;
  }
  const k = (coolant - CURVE_FIXED) / (outdoor - CURVE_FIXED);
  return (x) => CURVE_FIXED + k * (x - CURVE_FIXED);
};

const coolantAt = (
  { outdoorTemp1, coolantTemp1, outdoorTemp2, coolantTemp2 },
  outdoor,
  setpoint
) => {
  const low = line(outdoorTemp1, coolantTemp1);
  const high = line(outdoorTemp2, coolantTemp2);
  if (!low || !high || !isNumber(outdoor) || !isNumber(setpoint)) return null;
  const w =
    (setpoint - CURVE_SETPOINT_MIN) / (CURVE_SETPOINT_MAX - CURVE_SETPOINT_MIN);
  return (1 - w) * low(outdoor) + w * high(outdoor);
};

const runScript = (script) => {
  if (script) {
    service.run({ type: ACTION_SCRIPT_RUN, id: script });
  }
};

const loop = (id) => async () => {
  const dev = get(id);
  if (!dev) {
    instance.delete(id);
    return;
  }
  try {
    const target = dev[DHW_COOLANT_TEMP];
    const temp = (get(dev[DHW_SENSOR_DOMESTIC]) || {})[TEMPERATURE];
    const hysteresis = isNumber(dev[DHW_HYSTERESIS_DOMESTIC])
      ? dev[DHW_HYSTERESIS_DOMESTIC]
      : HYSTERESIS_DEFAULT;

    // default mode is heating; switch to DHW when domestic water is colder
    // than the target by hysteresis, and stay in DHW until the target is reached
    let mode = HEATING;
    if (isNumber(target) && isNumber(temp)) {
      if (temp < target - hysteresis || (dev[BOILER_MODE] === DHW && temp < target)) {
        mode = DHW;
      }
    }

    if (mode === DHW) {
      set(id, { [BOILER_MODE]: mode, setpoint: target + hysteresis });
    } else {
      // TODO: heating setpoint from the curve (coolantAt) and thermostats
      set(id, { [BOILER_MODE]: mode });
    }

    // scripts run only when the mode changes
    if (mode !== dev[BOILER_MODE]) {
      if (mode === DHW) {
        runScript(dev[DHW_ON_START_HEAT_DOMESTIC]);
      } else {
        // TODO: stub, real heating is not implemented yet
        runScript(dev[DHW_ON_STOP_HEAT_DOMESTIC]);
        runScript(dev[HEATING_ON_STOP_HEAT]);
      }
    }
  } catch (e) {
    console.error(e);
  }
  instance.set(id, setTimeout(loop(id), TIMEOUT));
};

module.exports.run = (action) => {
  const { id, type } = action;
};

module.exports.handle = (action) => {
  const { id, data } = action;
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
  instance.set(id, setTimeout(loop(id), 30000));
};
