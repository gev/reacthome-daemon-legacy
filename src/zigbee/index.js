
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
    // addDevice(id, device);
  });

  controller.on('deviceLeave', ({ device }) => {
    offline(device.ieeeAddr);
    del(id, DEVICE, device.ieeeAddr);
  });

  controller.on('deviceInterview', ({ device }) => {
    // console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    // console.log('intrview', device);
    online(device.ieeeAddr, device.networkAddress);
    addDevice(id, device);
  });

  controller.on('deviceAnnounce', ({ device }) => {
    online(device.ieeeAddr, device.networkAddress);
    device.endpoints.forEach(endpoint => {
      handle(device.ieeeAddr, endpoint);
    });
    // addDevice(id, device);
  });

  controller.on('message', ({ device, endpoint, data, type }) => {
    // console.log('-------------------');
    // console.log(JSON.stringify({type, endpoint, data}, null, 2));
    // console.log();
    // addDevice(id, device);
    online(device.ieeeAddr, device.networkAddress);
    handle(device.ieeeAddr, endpoint, data);
  });

  controller
  .start()
  .then(() => {
    controller.permitJoin(true);
    //controller.setTransmitPower(0xc5);
    controller.getNetworkParameters().then(param => {
      console.log(JSON.stringify(param, null, 2));
    });
    // controller.reset('soft');
    // controller.reset('hard');
    console.log(controller.getDevices().length);
    controller.getDevices().forEach(device => {
      device.endpoints.forEach(endpoint => {
        handle(device.ieeeAddr, endpoint);
      });
        addDevice(id, device);
      // online(device.ieeeAddr, device.networkAddress);
      // device.endpoints.forEach(endpoint => {
      //   const {inputClusters}
      // });
      // console.log('==========================');
      // console.log(JSON.stringify(device, null, 2));
      // console.log();
    });
//    setInterval(() => {
//      controller.getDevices().forEach(device => {
//        device.ping().catch(console.error);
//      });
//    }, 6000);
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
