module.exports.TIMEOUT = 5000;
module.exports.ADDRESS = 0;

// Number of installations (channels) by default
module.exports.CHANNELS = 7;
module.exports.CHANNELS_DEFAULT = 0;

// Setpoint limits
module.exports.SETPOINT_MIN = 5;
module.exports.SETPOINT_MAX = 35;

// Speed (fan_speed) limits
module.exports.SPEED_MIN = 0;
module.exports.SPEED_MAX = 100;

// Input registers (command 4), read in one request: 0 .. 46
module.exports.READ_START = 0;
module.exports.READ_COUNT = 47;

// Per channel i (0..6): speed at 2 * i, temperature at 2 * i + 1
module.exports.REG_SPEED = (i) => 2 * i;
module.exports.REG_TEMPERATURE = (i) => 2 * i + 1;

// Error codes: installations 32..38, drive (frequency converter) 39, dampers 40..46
module.exports.REG_ERROR = (i) => 32 + i;
module.exports.REG_ERROR_DRIVE = 39;
module.exports.REG_ERROR_DAMPER = (i) => 40 + i;

// Holding registers (command 6) for write: speed at 2 * i, temperature at 2 * i + 1
module.exports.WRITE_SPEED = (i) => 2 * i;
module.exports.WRITE_TEMPERATURE = (i) => 2 * i + 1;
