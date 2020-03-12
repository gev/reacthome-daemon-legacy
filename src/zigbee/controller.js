const { Controller } = require('zigbee-herdsman');
const { serialPort, databasePath, ZIGBEE } = require('./constants');

module.exports = new Controller({ databasePath, serialPort });

