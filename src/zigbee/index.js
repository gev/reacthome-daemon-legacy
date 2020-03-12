
const { Controller } = require('zigbee-herdsman');
const { set, add, del } = require('../actions');
const { DEVICE, DO } = require('../constants');
const { serialPort, databasePath, ZIGBEE } = require('./constants');
const { online, offline } = require('./online');

const config = ({ endpoints }) => 
  endpoints.reduce((config, { ID, inputClusters }) => 
    {
      inputClusters.forEach(cluster => {
        let type;
        switch(cluster) {
          case 6:
            type = DO
            break;
          default:
            return;
        }
        if (config[type]) {
          config[type].push(ID);
        } else {
          config[type] = [ID];
        }
      })
    }, {});

const addDevice = (id, device) => {
  const { ieeeAddr, manufacturerName, modelID, powerSource } = device;
  add(id, DEVICE, ieeeAddr);
  set(device.ieeeAddr, {
    protocol: ZIGBEE,
    vendor: manufacturerName,
    model: modelID,
    powerSource: powerSource,
    config: config(device)
  });
};

module.exports.start = (id) => {
  const controller = new Controller({ databasePath, serialPort });

  controller.on('deviceJoined', ({ device }) => {
    online(device.ieeeAddr, device.networkAddress);
    addDevice(id, device);
  });

  controller.on('deviceLeave', ({ device: { ieeeAddr } }) => {
    offline(ieeeAddr);
    del(id, DEVICE, ieeeAddr);
  });

  controller.on('deviceInterview', ({ device: { ieeeAddr, networkAddress, interviewCompleted } }) => {
    online(ieeeAddr, networkAddress);
    set(ieeeAddr, { interviewCompleted });
  });

  controller.on('deviceAnnounce', ({ device: { ieeeAddr, networkAddress }}) => {
    console.log(ieeeAddr, networkAddress);
    online(ieeeAddr);
  });

  controller.on('mesaage', (event) => {
    online(event.device.ieeeAddr, event.device.networkAddress);
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
