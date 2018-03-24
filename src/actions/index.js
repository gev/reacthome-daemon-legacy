
const set = require('./create');
const { online, offline } = require('./status');
const { pendingFirmware, updateFirmware } = require('./firmware');

module.exports = {
  set,
  online, offline,
  pendingFirmware, updateFirmware
};
