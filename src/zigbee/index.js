
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
    console.log(JSON.stringify(endpoint, null, 2));
    addDevice(id, device);
    online(device.ieeeAddr, device.networkAddress);
    handle(device.ieeeAddr, endpoint);
  });

  controller
  .start()
  .then(() => {
    controller.permitJoin(false);
    //controller.setTransmitPower(0xc5);
    controller.getNetworkParameters().then(param => {
      console.log(JSON.stringify(param, null, 2));
    });
    // controller.reset('soft');
    // controller.reset('hard');
    console.log(controller.getDevices().length);
    controller.getDevices().forEach(async device => {
    //   try {
    //     await device.removeFromNetwork();
    //   } catch (e) {
    //     console.log(e);
    //   }
    //   await device.removeFromDatabase();
    //   offline(id, device.ieeeAddr);
      addDevice(id, device);
      online(device.ieeeAddr, device.networkAddress);
    });
//    setInterval(() => {
//      controller.getDevices().forEach(device => {
//        device.ping().catch(console.error);
//      });
//    }, 6);
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
