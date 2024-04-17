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
  DEVICE_TYPE_DOPPLER_1_DI_4,
  DEVICE_TYPE_DOPPLER_5_DI_4,
  DEVICE_TYPE_SMART_TOP_G4D,
  DEVICE_TYPE_SMART_TOP_A6P,
  DEVICE_TYPE_DI_4,
} = require("../constants");
const { device } = require("../sockets");

const timeout = {};

const offline = (id) => {
  set(id, { online: false, ready: false, initialized: false });
};

const online = (id, props) => {
  clearTimeout(timeout[id]);
  const dev = get(id) || {};
  if (!dev.online) {
    switch (props.type) {
      case DEVICE_TYPE_DI_4:
      case DEVICE_TYPE_RELAY_2:
      case DEVICE_TYPE_MIX_1_RS:
      case DEVICE_TYPE_MIX_6x12_RS:
      case DEVICE_TYPE_RELAY_2_DIN:
      case DEVICE_TYPE_SMART_BOTTOM_1:
      case DEVICE_TYPE_SMART_BOTTOM_2:
      case DEVICE_TYPE_DOPPLER_1_DI_4:
      case DEVICE_TYPE_DOPPLER_5_DI_4: {
        device.sendRBUS(
          Buffer.from([
            ACTION_GET_STATE,
          ]),
          id
        );
        break;
      }
      case DEVICE_TYPE_SMART_TOP_G4D:
      case DEVICE_TYPE_SMART_TOP_A6P: {
        device.sendTOP(
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
