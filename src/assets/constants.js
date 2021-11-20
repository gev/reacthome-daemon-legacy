const os = require("os");
const path = require("path");

const p = (...s) => path.join(os.homedir(), ...s);

module.exports.VAR = p(".hommyn-daemon");
module.exports.DB = p(".hommyn-daemon", "db");
module.exports.TMP = p(".hommyn-daemon", "tmp");
module.exports.ASSETS = p(".hommyn-daemon", "assets");
module.exports.ZIGBEE = p(".hommyn-daemon", "zigbee");
