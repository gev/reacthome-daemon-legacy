const { Controller } = require('zigbee-herdsman');
const { zigbee } = require('../fs');

module.exports = new Controller({
  databasePath: zigbee('devices.json'), 
  serialPort: {
    path: '/dev/ttyAMA0',
    adapter: 'zstack',
    rtscts: false,
  }, 
  network: {
    channelList: [14],
  },
});

