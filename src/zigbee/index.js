
const { Controller } = require('zigbee-herdsman');
const { set, add, del } = require('../actions');
const { DEVICE } = require('../constants');
const { serialPort, databasePath } = require('./constants');
const { online, offline } = require('./online');

const addDevice = (id, device) => {
  add(id, DEVICE, device.ieeeAddr);
  // set(device.ieeeAddr);
};

module.exports.start = (id) => {
  const controller = new Controller({ databasePath, serialPort });

  controller.on('deviceJoined', ({ device }) => {
    online(device.ieeeAddr);
    addDevice(id, device);
  });

  controller.on('deviceLeave', ({ device: { ieeeAddr } }) => {
    offline(ieeeAddr);
    del(id, DEVICE, ieeeAddr);
  });

  controller.on('deviceInterview', ({ device: { ieeeAddr, interviewCompleted } }) => {
    online(ieeeAddr);
    set(ieeeAddr, { interviewCompleted });
  });

  controller.on('deviceAnnounce', ({ device: { ieeeAddr }}) => {
    console.log(ieeeAddr);
    online(ieeeAddr);
  });

  controller.on('mesaage', (event) => {
    online(event.device.ieeeAddr);
  });

  controller
  .start()
  .then(() => {
    controller.permitJoin(true);
    controller.getDevices().forEach(device => {
      offline(id, device.ieeeAddr);
      addDevice(id, device);
    });
  });
};
