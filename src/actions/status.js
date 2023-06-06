const { get, set, add } = require("./create");
const { initialize } = require("./init");
const { updateFirmware } = require("./firmware");
const {
  DEVICE,
  DISCOVERY_INTERVAL,
  DEVICE_TYPE_RELAY_2,
  DEVICE_TYPE_RELAY_2_DIN,
  ACTION_GET_STATE,
  ACTION_RBUS_TRANSMIT,
  DEVICE_TYPE_MIX_1_RS,
} = require("../constants");
const mac = require("../mac");
const { device } = require("../sockets");

const timeout = {};

const offline = (id) => {
  set(id, { online: false, ready: false, initialized: false });
};

const online = (id, type, version, ip, ready) => {
  clearTimeout(timeout[id]);
  const dev = get(id) || {};
  if (!dev.online) {
    switch (type) {
      case DEVICE_TYPE_RELAY_2:
      case DEVICE_TYPE_MIX_1_RS:
      case DEVICE_TYPE_RELAY_2_DIN: {
        device.send(
          Buffer.from([
            ACTION_RBUS_TRANSMIT,
            ...id.split(":").map((i) => parseInt(i, 16)),
            ACTION_GET_STATE,
          ]),
          dev.ip
        );
        break;
      }
    }
  }
  set(id, {
    type,
    version,
    ip,
    ready,
    online: true,
  });
  add(mac(), DEVICE, id);
  // if (!device.initialized) initialize(id);
  if (dev.pending) updateFirmware(id);
  timeout[id] = setTimeout(() => {
    offline(id);
    delete timeout[id];
  }, 10 * DISCOVERY_INTERVAL);
};

module.exports = { offline, online };
