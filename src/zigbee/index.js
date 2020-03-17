
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
        if (clusters.has(dispatchEvent)) {
          const cluster = clusters.get(di);
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

  controller.on('deviceLeave', ({ device: { ieeeAddr } }) => {
    offline(ieeeAddr);
    del(id, DEVICE, ieeeAddr);
  });

  controller.on('deviceInterview', ({ device: { ieeeAddr, networkAddress, interviewCompleted } }) => {
    online(ieeeAddr, networkAddress);
    set(ieeeAddr, { interviewCompleted });
  });

  controller.on('deviceAnnounce', ({ device: { ieeeAddr, networkAddress }}) => {
    online(ieeeAddr, networkAddress);
  });

  controller.on('message', ({ device: { ieeeAddr, networkAddress }, endpoint }) => {
    // console.log(JSON.stringify(endpoint, null, 2));
    online(ieeeAddr, networkAddress);
    handle(ieeeAddr, endpoint);
  });

  controller
  .start()
  .then(() => {
    controller.permitJoin(true);
    controller.getDevices().forEach(device => {
      offline(id, device.ieeeAddr);
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
