const { Controller } = require('zigbee-herdsman');
const { zigbee } = require('../fs');

module.exports = new Controller({
  databasePath: zigbee('devices.json'), 
  serialPort: {
    path: '/dev/ttyS0',
  }, 
  network: {
    channelList: [15, 20, 25],
  },
});

