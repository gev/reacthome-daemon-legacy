const { Controller } = require('zigbee-herdsman');
const { zigbee } = require('../fs');

module.exports = new Controller({
  databasePath: zigbee('devices.json'), 
  serialPort: {
    path: '/dev/ttyAMA0',
  }, 
  network: {
    channelList: [3]
  }
});

