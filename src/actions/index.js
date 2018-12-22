
const { get, set, add, apply, applySite } = require('./create');
const { online, offline } = require('./status');
const { pendingFirmware, updateFirmware } = require('./firmware');
const { initialize, initialized } = require('./init');
const { count_on, count_off } = require('./count');

module.exports = {
  get, set, add, apply, applySite,
  online, offline,
  pendingFirmware, updateFirmware,
  initialize, initialized,
  count_on, count_off,
};
