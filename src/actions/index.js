
const { get, set, add, apply, applySite } = require('./create');
const { online, offline } = require('./status');
const { pendingFirmware, updateFirmware } = require('./firmware');
const { initialize, initialized } = require('./init');
const { count, count_on, count_off } = require('./count');
const { start } = require ('./start');

module.exports = {
  get, set, add, apply, applySite,
  online, offline,
  pendingFirmware, updateFirmware,
  initialize, initialized,
  count, count_on, count_off,
  start
};
