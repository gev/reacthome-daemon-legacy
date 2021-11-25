const { Controller } = require("zigbee-herdsman");
const { zigbee } = require("../fs");
const { parse } = require("uuid");

let controller;

module.exports.createController = (id) => {
  const data = Array.from(parse(id));
  controller = new Controller({
    databasePath: zigbee("devices.json"),
    serialPort: {
      path: "/dev/ttyAMA0",
      adapter: "zstack",
    },
    network: {
      panID: data.slice(0, 2),
      extendedPanID: data.slice(2, 10),
      channelList: [
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
      ],
    },
    concurrent: 16,
  });
  return controller;
};

module.exports.getController = () => controller;
