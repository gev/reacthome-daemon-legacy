
const { set, add } = require('./create');
const { online, offline } = require('./status');
const { pendingFirmware, updateFirmware } = require('./firmware');
const { initialize, initialized } = require('./init');

module.exports = {
  set, add,
  online, offline,
  pendingFirmware, updateFirmware,
  initialize, initialized
};
