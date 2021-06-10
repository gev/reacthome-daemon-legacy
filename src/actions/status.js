const { get, set, add } = require("./create");
const { initialize } = require("./init");
const { updateFirmware } = require("./firmware");
const { DEVICE, DISCOVERY_INTERVAL } = require("../constants");
const mac = require("../mac");

const timeout = {};

const offline = (id) => {
  set(id, { online: false, ready: false, initialized: false });
};

const online = (id, type, version, ip, ready) => {
  clearTimeout(timeout[id]);
  set(id, {
    type,
    version,
    ip,
    online: true,
    ready,
  });
  add(mac(), DEVICE, id);
  const device = get(id);
  // if (!device.initialized) initialize(id);
  if (device.pending) updateFirmware(id);
  timeout[id] = setTimeout(() => {
    offline(id);
    delete timeout[id];
  }, 10 * DISCOVERY_INTERVAL);
};

module.exports = { offline, online };
