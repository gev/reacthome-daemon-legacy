
const { zigbee } = require('../fs');

module.exports.ZIGBEE = 'zigbee';
module.exports.serialPort = { path: './dev/ttyAMA0' };
module.exports.databasePath = zigbee('devices.json');
