
const { get, set, add, del } = require('../actions');
const { DEVICE } = require('../constants');
const { ZIGBEE } = require('./constants');
const { online, offline } = require('./online');
const controller = require('./controller');
const clusters = require('./clusters');
const handle = require('./in');

const config = ({ endpoints }) => 
  endpoints.reduce((config, { ID, inputClusters }) => 
    {
      inputClusters.forEach(id => {
        if (clusters.has(id)) {
          const cluster = clusters.get(id);
          if (Array.isArray(config[cluster])) {
            config[cluster].push(ID);
          } else {
            config[cluster] = [ID];
          }
        }
      });
      return config;
    }, {});

const addDevice = (id, device) => {
  const { ieeeAddr, manufacturerName, modelID, powerSource, interviewCompleted } = device;
  add(id, DEVICE, ieeeAddr);
  set(ieeeAddr, {
    protocol: ZIGBEE,
    vendor: manufacturerName,
    model: modelID,
    powerSource: powerSource,
    config: config(device),
    interviewCompleted
  });
};

module.exports.start = (id) => {

  controller.on('deviceJoined', ({ device }) => {
    online(device.ieeeAddr, device.networkAddress);
    addDevice(id, device);
  });

  controller.on('deviceLeave', ({ device }) => {
    offline(device.ieeeAddr);
    del(id, DEVICE, device.ieeeAddr);
  });

  controller.on('deviceInterview', ({ device }) => {
    online(device.ieeeAddr, device.networkAddress);
    addDevice(id, device);
  });

  controller.on('deviceAnnounce', ({ device }) => {
    online(device.ieeeAddr, device.networkAddress);
    addDevice(id, device);
  });

  controller.on('message', ({ device, endpoint }) => {
    // console.log(JSON.stringify(endpoint, null, 2));
    addDevice(id, device);
    online(device.ieeeAddr, device.networkAddress);
    handle(device.ieeeAddr, endpoint);
  });

  controller
  .start()
  .then(() => {
    // controller.reset();
    controller.permitJoin(true);
    controller.getDevices().forEach(async device => {
      // try {
      //   await device.removeFromNetwork();
      // } catch (e) {
      //   console.log(e);
      // }
      // await device.removeFromDatabase();
      // offline(id, device.ieeeAddr);
      addDevice(id, device);
    });
    // setInterval(() => {
    //   controller.getDevices().forEach(device => {
    //     const {code} = get(device.ieeeAddr) || {};
    //     device.lqi()
    //       .then(lqi => {console.log(code || device.ieeeAddr, device.networkAddress, JSON.stringify(lqi.neighbors, null, 2))})
    //       .catch(console.error);
    //   });
    // }, 10000);
  });
};
