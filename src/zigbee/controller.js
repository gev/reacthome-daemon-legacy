const { Controller } = require('zigbee-herdsman');
const { zigbee } = require('../fs');

module.exports = new Controller({
  databasePath: zigbee('devices.json'), 
  serialPort: {
    path: '/dev/ttyACM0',
    adapter: 'zstack',
  }, 
  network: {
    channelList: [14],
  },
  concurrent: 16,
});

