const fs = require("fs");
const { set } = require("./actions");

const folderFirmware = "firmware";

const packets = {};

const initFirmware = (id) => {
  const firmwares = {};
  const files = fs.readdirSync(folderFirmware);
  for (const firmware of files) {
    const packet = fs
      .readFileSync(`${folderFirmware}/${firmware}`, "utf8")
      .split("\n");
    const header = packet[0];

    const length = parseInt(header.substring(0, 8), 16);
    const deviceType = parseInt(header.substring(8, 12), 16);
    const boardVersion = parseInt(header.substring(12, 14), 16);
    const firmwareMajorVersion = parseInt(header.substring(14, 16), 16);
    const firmwareMinorVersion = parseInt(header.substring(16, 18), 16);
    const dfuMajorVersion = parseInt(header.substring(18, 20), 16);
    const mcuName = Buffer.from(header.substring(22), "hex").toString();

    const key = `${deviceType}_${boardVersion}_${dfuMajorVersion}_${mcuName}`;

    console.log(key);

    const version = `${firmwareMajorVersion}.${firmwareMinorVersion}`;

    const list = firmwares[key] || [];
    firmwares[key] = [...list, { firmware, version, length }];
    packets[firmware] = Buffer.from(packet, "hex");
  }
  set(id, { firmwares });
  console.log(firmwares);
  console.log(packets);
};

module.exports.initFirmware = initFirmware;
module.exports.getFirmware = (file) => packets[file];
