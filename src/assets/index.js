const { mkdirSync, existsSync } = require("fs");
const { DB, ASSETS, TMP, VAR, ZIGBEE } = require("./constants");

const init = (...path) => path.map(async (i) => existsSync(i) || mkdirSync(i));

module.exports.init = async () => {
  init(VAR);
  init(DB, ASSETS, TMP, ZIGBEE);
};
