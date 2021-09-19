const { Controller } = require("zigbee-herdsman");
const { zigbee } = require("../fs");
const { parse } = require("uuid");

module.exports = (id) => {
  const data = Array.from(parse(id));
  return new Controller({
    databasePath: zigbee("devices.json"),
    serialPort: {
      path: "/dev/ttyAMA0",
      adapter: "zstack",
    },
    network: {
      panID: data.slice(0, 2),
      extendedPanID: data.slice(2, 10),
      channelList: [14],
    },
    concurrent: 16,
  });
};
