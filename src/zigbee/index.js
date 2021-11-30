const { get, set, add, del } = require("../actions");
const { DEVICE } = require("../constants");
const { ZIGBEE } = require("./constants");
const { online, offline } = require("./online");
const { createController } = require("./controller");
const clusters = require("./clusters");
const type = require("./type");
const handle = require("./in");

const addDevice = (id, device) => {
  const {
    ieeeAddr,
    manufacturerName,
    modelID,
    powerSource,
    interviewCompleted,
  } = device;
  add(id, DEVICE, ieeeAddr);
  set(ieeeAddr, {
    protocol: ZIGBEE,
    vendor: manufacturerName,
    model: modelID,
    powerSource: powerSource,
    endpoint: clusters(device),
    type: type(device),
    interviewCompleted,
  });
};

module.exports.start = async (id) => {
  const controller = createController(id);
  controller.on("deviceJoined", ({ device }) => {
    online(device.ieeeAddr, device.networkAddress);
    addDevice(id, device);
  });
  controller.on("deviceLeave", ({ device }) => {
    offline(device.ieeeAddr);
    del(id, DEVICE, device.ieeeAddr);
  });
  controller.on("deviceInterview", ({ device }) => {
    online(device.ieeeAddr, device.networkAddress);
    addDevice(id, device);
    device.endpoints.forEach((endpoint) => {
      handle(device.ieeeAddr, endpoint);
    });
  });
  controller.on("deviceAnnounce", ({ device }) => {
    online(device.ieeeAddr, device.networkAddress);
  });
  controller.on("message", ({ device, endpoint, data }) => {
    online(device.ieeeAddr, device.networkAddress);
    handle(device.ieeeAddr, endpoint, data);
  });
  try {
    await controller.start();
    // await controller.reset("soft");
    await controller.setTransmitPower(22);
    await controller.permitJoin(true);
  } catch (e) {
    console.error(e);
  }
};
