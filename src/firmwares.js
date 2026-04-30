const fs = require("fs");
const { set } = require("./src/actions");

const firmwares = {};

const folderFirmware = "firmware";

const initFirmware = (id) => {
  const files = fs.readdirSync(folderFirmware);
  for (const firmware of files) {
    const header = fs
      .readFileSync(`${folderFirmware}/${firmware}`, "utf8")
      .split("\n")[0];

    const deviceType = parseInt(header.substring(1, 5), 16);
    const boardVersion = parseInt(header.substring(5, 7), 16);
    const dfuMajorVersion = parseInt(header.substring(11, 13), 16);
    const mcuName = header.substring(15);

    const key = `${deviceType}_${boardVersion}_${dfuMajorVersion}_${mcuName}`;

    const firmwareMajorVersion = parseInt(header.substring(7, 9), 16);
    const firmwareMinorVersion = parseInt(header.substring(9, 11), 16);
    const version = `${firmwareMajorVersion}.${firmwareMinorVersion}`;

    const list = firmwares[key] || [];
    firmwares[key] = [...list, { firmware, version }];
  }
  set(id, { firmwares });
};

module.exports.initFirmware = initFirmware;
module.exports.firmwares = firmwares;
