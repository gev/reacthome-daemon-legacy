const { THERMOSTAT, MOTION_SENSOR, CLIMATE_SENSOR } = require("../constants");

module.exports = (device) => {
  switch (device.modelID) {
    case "88teujp\u0000":
    case "TS0601":
      return THERMOSTAT;
    case "b467083cfc864f5e826459e5d8ea6079":
      return CLIMATE_SENSOR;
  }
};
