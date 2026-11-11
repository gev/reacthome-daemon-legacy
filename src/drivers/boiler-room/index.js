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
  BOILER_RECIRCULATION,
  DHW_SENSOR_RECIRCULATION,
  DHW_DIFF_START_RECIRCULATION,
  DHW_DIFF_STOP_RECIRCULATION,
  DHW_ON_START_HEAT_RECIRCULATION,
  DHW_ON_STOP_HEAT_RECIRCULATION,
  DIFF_START_DEFAULT,
  DIFF_STOP_DEFAULT,
  DIFF_MIN_GAP,
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
    const prevMode = dev[BOILER_MODE];
    const target = dev[DHW_COOLANT_TEMP];
    const temp = (get(dev[DHW_SENSOR_DOMESTIC]) || {})[TEMPERATURE];
    const hysteresis = isNumber(dev[DHW_HYSTERESIS_DOMESTIC])
      ? dev[DHW_HYSTERESIS_DOMESTIC]
      : HYSTERESIS_DEFAULT;

    // default mode is heating; switch to DHW when domestic water is colder
    // than target - hysteresis, and stay in DHW until it reaches target + hysteresis
    let mode = HEATING;
    if (isNumber(target) && isNumber(temp)) {
      if (temp < target - hysteresis || (prevMode === DHW && temp < target + hysteresis)) {
        mode = DHW;
      }
    }

    // TODO: heating setpoint from the curve (coolantAt) and thermostats
    set(id, { [BOILER_MODE]: mode });

    // scripts run only when the mode changes
    if (mode !== prevMode) {
      if (mode === DHW) {
        console.log("run script", dev[DHW_ON_START_HEAT_DOMESTIC]);
        runScript(dev[DHW_ON_START_HEAT_DOMESTIC]);
      } else {
        // TODO: stub, real heating is not implemented yet
        runScript(dev[DHW_ON_STOP_HEAT_DOMESTIC]);
        runScript(dev[HEATING_ON_STOP_HEAT]);
      }
    }

    // recirculation is independent of the mode: start when recirculation sensor
    // is colder than domestic by more than diffStart, stop when the difference is less than diffStop
    const prevRecirculation = dev[BOILER_RECIRCULATION];
    const tempRecirculation = (get(dev[DHW_SENSOR_RECIRCULATION]) || {})[TEMPERATURE];
    if (isNumber(temp) && isNumber(tempRecirculation)) {
      const diff = temp - tempRecirculation;
      const diffStop = isNumber(dev[DHW_DIFF_STOP_RECIRCULATION])
        ? dev[DHW_DIFF_STOP_RECIRCULATION]
        : DIFF_STOP_DEFAULT;
      let diffStart = isNumber(dev[DHW_DIFF_START_RECIRCULATION])
        ? dev[DHW_DIFF_START_RECIRCULATION]
        : DIFF_START_DEFAULT;
      // start must be above stop by at least DIFF_MIN_GAP, otherwise derive it from stop
      if (diffStart - diffStop < DIFF_MIN_GAP) {
        diffStart = diffStop + DIFF_MIN_GAP;
      }
      let recirculation = prevRecirculation === true;
      if (diff > diffStart) {
        recirculation = true;
      } else if (diff < diffStop) {
        recirculation = false;
      }
      set(id, { [BOILER_RECIRCULATION]: recirculation });
      // scripts run only when the state changes
      if (recirculation !== prevRecirculation) {
        runScript(
          recirculation
            ? dev[DHW_ON_START_HEAT_RECIRCULATION]
            : dev[DHW_ON_STOP_HEAT_RECIRCULATION]
        );
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
