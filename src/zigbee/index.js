
const { Controller } = require('zigbee-herdsman');
const { set, add, del } = require('../actions');
const { DEVICE } = require('../constants');
const { serialPort, databasePath } = require('./constants');
const { online, offline } = require('./online');

const addDevice = (id, device) => {
  add(id, DEVICE, device.ieeeAddr);
  // set(device.ieeeAddr);
}

module.exports.start = (id) => {
  const controller = new Controller({ databasePath, serialPort });

  controller.on('deviceJoined', ({ device }) => {
    addDevice(id, device);
    online(device.ieeeAddr);
  });

  controller.on('deviceLeave', ({ device: { ieeeAddr } }) => {
    del(id, DEVICE, ieeeAddr);
    offline(ieeeAddr);
  });

  controller.on()

  controller.on('deviceInterview', ({ device: { ieeeAddr, interviewCompleted } }) => {
    set(ieeeAddr, { interviewCompleted });
    online(ieeeAddr);
  });

  controller.on('deviceAnnounce', ({ device: { ieeeAddr }}) => {
    online(ieeeAddr);
  });

  controller.on('mesaage', (event) => {
    online(event.device.ieeeAddr);
  })

  controller
  .start()
  .then(() => {
    controller.permitJoin(true);
    controller.getDevices().forEach(device => {
     addDevice(id, device);
    });
  });
};
