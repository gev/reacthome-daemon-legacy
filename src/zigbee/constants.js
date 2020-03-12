
const {zigbee} = require('../assets');

module.exports.ZIGBEE = 'zigbee';
module.exports.databasePath = { path: './data/dev.db' };
module.exports.databasePath = zigbee('devices.json');
