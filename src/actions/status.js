const { get, set } = require("./create");
const {
  DISCOVERY_INTERVAL,
  DEVICE_TYPE_RELAY_2,
  DEVICE_TYPE_RELAY_2_DIN,
  ACTION_GET_STATE,
  DEVICE_TYPE_MIX_1_RS,
  DEVICE_TYPE_MIX_6x12_RS,
  DEVICE_TYPE_SMART_BOTTOM_1,
  DEVICE_TYPE_SMART_BOTTOM_2,
} = require("../constants");
const { device } = require("../sockets");

const timeout = {};

const offline = (id) => {
  console.log('offline', get(id))
  set(id, { online: false, ready: false, initialized: false });
};

const online = (id, props) => {
  clearTimeout(timeout[id]);
  const dev = get(id) || {};
  if (!dev.online) {
    console.log('online', props, dev)
    switch (props.type) {
      case DEVICE_TYPE_RELAY_2:
      case DEVICE_TYPE_MIX_1_RS:
      case DEVICE_TYPE_MIX_6x12_RS:
      case DEVICE_TYPE_RELAY_2_DIN:
      case DEVICE_TYPE_SMART_BOTTOM_1:
      case DEVICE_TYPE_SMART_BOTTOM_2: {
        device.sendRBUS(
          Buffer.from([
            ACTION_GET_STATE,
          ]),
          id
        );
        break;
      }
      default: {
        device.send(
          Buffer.from([
            ACTION_GET_STATE
          ]),
          dev.ip
        );
      }
    }
  }
  set(id, { ...props, online: true });
  timeout[id] = setTimeout(() => {
    offline(id);
    delete timeout[id];
  }, 2 * DISCOVERY_INTERVAL);
};

module.exports = { offline, online };
