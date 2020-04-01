
const { get, set, add, del } = require('../actions');
const { DEVICE } = require('../constants');
const { ZIGBEE } = require('./constants');
const { online, offline } = require('./online');
const controller = require('./controller');
const clusters = require('./clusters');
const handle = require('./in');

const addDevice = (id, device) => {
  const { ieeeAddr, manufacturerName, modelID, powerSource, interviewCompleted, endpoints } = device;
  add(id, DEVICE, ieeeAddr);
  set(ieeeAddr, {
    protocol: ZIGBEE,
    vendor: manufacturerName,
    model: modelID,
    powerSource: powerSource,
    config: clusters(endpoints),
    interviewCompleted
  });
};

module.exports.start = (id) => {

  controller.on('deviceJoined', ({ device }) => {
    online(device.ieeeAddr, device.networkAddress);
    add(id, DEVICE, device.ieeeAddr);
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
  });

  controller.on('message', ({ device, endpoint, data, type }) => {
    console.log('-------------------');
    console.log(JSON.stringify({type, endpoint, data}, null, 2));
    console.log();
    online(device.ieeeAddr, device.networkAddress);
    handle(device.ieeeAddr, endpoint, data);
  });

  controller
  .start()
  .then(() => {
    controller.permitJoin(true);
    controller.setTransmitPower(22);
    controller.getNetworkParameters().then(param => {
      console.log(JSON.stringify(param, null, 2));
    });
    console.log(controller.getDevices().length);
    controller.getDevices().forEach(device => {
      addDevice(id, device);
    });
//    setInterval(() => {
//      console.log('-----------------------------------------------------------------');
//      controller.getDevices().forEach(async device => {
//        const {code} = get(device.ieeeAddr) || {};
//        console.log(code || device.ieeeAddr);
//        try {
//          const lqi = await device.lqi();
//          console.log('lqi:', device.networkAddress, JSON.stringify(lqi, null, 2));
//          const table = await device.routingTable();
//          console.log('routing table:', device.networkAddress, JSON.stringify(table, null, 2));
//        } catch (e) {
//          // console.error(e);
//        }
//        console.log();
//      });
//    }, 60000);
  });
};
