module.exports.TIMEOUT = 5000;

module.exports.COOLANT_MIN = 30;
module.exports.COOLANT_MAX = 80;

// Heating curve: line through the fixed point (20, 20) and a second point,
// two lines for setpoints 10 and 40 °C, linear interpolation in between.
module.exports.CURVE_FIXED = 20;
module.exports.CURVE_SETPOINT_MIN = 10;
module.exports.CURVE_SETPOINT_MAX = 40;

// Fields in studio, all stored in the main card <id>.
// Boiler
module.exports.BOILER_SENSOR_IN = "boilerSensorIn";
module.exports.BOILER_SENSOR_OUT = "boilerSensorOut";
module.exports.BOILER_COOLANT_MIN_TEMP = "boilerCoolantMinTemp";
module.exports.BOILER_COOLANT_MAX_TEMP = "boilerCoolantMaxTemp";
module.exports.BOILER_MODE = "boilerMode"; // written by server
module.exports.BOILER_TEMPERATURE = "boilerTemperature"; // written by server
module.exports.BOILER_RECIRCULATION = "boilerRecirculation"; // written by server

// DHW
module.exports.DHW_COOLANT_TEMP = "dhwCoolantTemp";
module.exports.DHW_SENSOR_DOMESTIC = "dhwSensorDomestic";
module.exports.DHW_HYSTERESIS_DOMESTIC = "dhwHysteresisDomestic";
module.exports.DHW_ON_START_HEAT_DOMESTIC = "dhwOnStartHeatDomestic";
module.exports.DHW_ON_STOP_HEAT_DOMESTIC = "dhwOnStopHeatDomestic";
module.exports.DHW_SENSOR_RECIRCULATION = "dhwSensorRecirculation";
module.exports.DHW_DIFF_START_RECIRCULATION = "dhwDiffStartRecirculation";
module.exports.DHW_DIFF_STOP_RECIRCULATION = "dhwDiffStopRecirculation";
module.exports.DHW_ON_START_HEAT_RECIRCULATION = "dhwOnStartHeatRecirculation";
module.exports.DHW_ON_STOP_HEAT_RECIRCULATION = "dhwOnStopHeatRecirculation";

// Heating
module.exports.HEATING_THERMOSTAT = "heatingThermostat";
module.exports.HEATING_ON_START_HEAT = "heatingOnStartHeat";
module.exports.HEATING_ON_STOP_HEAT = "heatingOnStopHeat";

// Curve
module.exports.CURVE_SENSOR_OUTDOOR = "curveSensorOutdoor";
module.exports.CURVE_OUTDOOR_TEMP_1 = "curveOutdoorTemp1";
module.exports.CURVE_COOLANT_TEMP_1 = "curveCoolantTemp1";
module.exports.CURVE_OUTDOOR_TEMP_2 = "curveOutdoorTemp2";
module.exports.CURVE_COOLANT_TEMP_2 = "curveCoolantTemp2";

module.exports.HYSTERESIS_DEFAULT = 5;
