const fs = require("fs");
const { set } = require("./actions");
const { ACTION_UPDATE_FIRMWARE } = require("./constants");

const folderFirmware = "firmware";

const packets = {};

const initFirmware = (id) => {
  const firmwares = {};
  const files = fs.readdirSync(folderFirmware);
  for (const firmware of files) {
    const pack = fs
      .readFileSync(`${folderFirmware}/${firmware}`, "utf8")
      .split("\n");

    const header = pack[0];

    const deviceType = parseInt(header.substring(4, 8), 16);
    const boardVersion = parseInt(header.substring(8, 10), 16);
    const firmwareMajorVersion = parseInt(header.substring(10, 12), 16);
    const firmwareMinorVersion = parseInt(header.substring(12, 14), 16);
    const dfuMajorVersion = parseInt(header.substring(14, 16), 16);
    const mcuName = Buffer.from(header.substring(18), "hex").toString();

    const key = `${deviceType}_${boardVersion}_${dfuMajorVersion}_${mcuName}`;

    const version = `${firmwareMajorVersion}.${firmwareMinorVersion}`;

    const list = firmwares[key] || [];
    firmwares[key] = [...list, { firmware, version }];
    packets[firmware] = pack.map((p, i) =>
      Buffer.concat([
        Buffer.from([ACTION_UPDATE_FIRMWARE, i >> 8, i & 0xff]),
        Buffer.from(p, "hex"),
      ]),
    );
  }
  set(id, { firmwares });
};

module.exports.initFirmware = initFirmware;
module.exports.getFirmware = (file, index = 0) => file && packets[file][index];
