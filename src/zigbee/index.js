
const { get, set, add, del } = require('../actions');
const { DEVICE } = require('../constants');
const { ZIGBEE } = require('./constants');
const { online, offline } = require('./online');
const controller = require('./controller');
const clusters = require('./clusters');
const handle = require('./in');

const addDevice = (id, device) => {
  const { ieeeAddr, manufacturerName, modelID, powerSource, interviewCompleted } = device;
  add(id, DEVICE, ieeeAddr);
  set(ieeeAddr, {
    protocol: ZIGBEE,
    vendor: manufacturerName,
    model: modelID,
    powerSource: powerSource,
    endpoint: clusters(device),
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
    device.endpoints.forEach(endpoint => {
      handle(device.ieeeAddr, endpoint);
    })
  });

  controller.on('deviceAnnounce', ({ device }) => {
    // console.log('anonce', device);
    online(device.ieeeAddr, device.networkAddress);
  });

  controller.on('message', ({ device, endpoint, data }) => {
    // console.log(endpoint, data);
    online(device.ieeeAddr, device.networkAddress);
    handle(device.ieeeAddr, endpoint, data);
  });

  controller
  .start()
  .then(() => {
    controller.permitJoin(true);
    controller.setTransmitPower(22);
    // controller.getNetworkParameters().then(param => {
    //   console.log(JSON.stringify(param, null, 2));
    // });
    // console.log(controller.getDevices().length);
    controller.getDevices().forEach(device => {
      // console.log('-----------------------------------------------------------------');
      // console.log(JSON.stringify(device, null, 2));
      // addDevice(id, device);
      // device.endpoints.forEach(endpoint => {
      //   handle(device.ieeeAddr, endpoint);
      // });
    });
  //  setInterval(() => {
  //    console.log('-----------------------------------------------------------------');
  //    controller.getDevices().forEach(async device => {
  //      const {code} = get(device.ieeeAddr) || {};
  //      console.log(code || device.ieeeAddr);
  //      try {
  //        const lqi = await device.lqi();
  //        console.log('lqi:', device.networkAddress, JSON.stringify(lqi, null, 2));
  //        const table = await device.routingTable();
  //        console.log('routing table:', device.networkAddress, JSON.stringify(table, null, 2));
  //      } catch (e) {
  //        // console.error(e);
  //      }
  //      console.log();
  //    });
  //  }, 60000);
  });
};
