
const { get, set, add, apply, applySite, count_on, count_off } = require('./create');
const { online, offline } = require('./status');
const { pendingFirmware, updateFirmware } = require('./firmware');
const { initialize, initialized } = require('./init');

module.exports = {
  get, set, add, apply, applySite, count_on, count_off,
  online, offline,
  pendingFirmware, updateFirmware,
  initialize, initialized
};
