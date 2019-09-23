
const {
  DO,
  DI,
  DIM,
  RS485,
  ARTNET,
  ACTION_INITIALIZE,
  DEVICE,
  DEVICE_PORT,
  DEVICE_TYPE_DO8,
  DEVICE_TYPE_DO12,
  DEVICE_TYPE_RELAY_6,
  DEVICE_TYPE_RELAY_12,
  DEVICE_TYPE_RELAY_24,
  DEVICE_TYPE_DI24,
  DEVICE_TYPE_DIM4,
  DEVICE_TYPE_DIM_4,
  DEVICE_TYPE_DIM8,
  DEVICE_TYPE_DIM_8,
  DEVICE_TYPE_ARTNET,
  DEVICE_TYPE_SENSOR4,
  DEVICE_TYPE_PLC,
  DISCOVERY_INTERVAL
} = require('../constants');
const { get, set, add } = require('./create');
const { device } = require('../sockets');
const mac = require('../mac');

module.exports.initialized = (id) => {
  set(id, { initialized: true });
}

const confirm = (id, data) => {
  const { ip } = get(id);
  device.sendConfirm(data, ip, () => {
    const { initialized } = get(id);
    return initialized;
  }, 4 * DISCOVERY_INTERVAL);
};

module.exports.initialize = (id) => {
  add(mac(), DEVICE, id);
  set(id, { initialized: false });
  const dev = get(id);
  const a = [ACTION_INITIALIZE];
  console.log(dev);
  switch (dev.type) {
    case DEVICE_TYPE_SENSOR4: {
      for (let i = 1; i <= 4; i++) {
        const channel = get(`${id}/${DI}/${i}`);
        a[i] = (channel && channel.value) || 0;
      }
      break;
    }
    case DEVICE_TYPE_DI24: {
      for (let i = 1; i <= 24; i++) {
        const channel = get(`${id}/${DI}/${i}`);
        a[i] = (channel && channel.value) || 0;
      }
      break;
    }
    case DEVICE_TYPE_DO8: {
      for (let i = 1; i <= 8; i++) {
        const channel = get(`${id}/${DO}/${i}`);
        a[i] = (channel && channel.value) || 0;
      }
      break;
    }
    case DEVICE_TYPE_DO12: {
      for (let i = 1; i <= 12; i++) {
        const channel = get(`${id}/${DO}/${i}`);
        a[i] = (channel && channel.value) || 0;
      }
      break;
    }
    case DEVICE_TYPE_RELAY_6: {
      for (let i = 1; i <= 6; i++) {
        const channel = get(`${id}/${DO}/${i}`);
        a[i] = (channel && channel.value) || 0;
      }
      const { is_rbus, baud, line_control } = get(`${id}/${RS485}/1`);
      a[ 7] = is_rbus;
      a[ 8] = (baud) & 0xff;
      a[ 9] = (baud >>  8) & 0xff;
      a[10] = (baud >> 16) & 0xff;
      a[11] = (baud >> 24) & 0xff;
      a[12] = line_control;
      break;
    }
    case DEVICE_TYPE_RELAY_12: {
      for (let i = 1; i <= 12; i++) {
        const channel = get(`${id}/${DO}/${i}`);
        a[i] = (channel && channel.value) || 0;
      }
      const { is_rbus, baud, line_control } = get(`${id}/${RS485}/1`);
      a[13] = is_rbus;
      a[14] = (baud) & 0xff;
      a[15] = (baud >>  8) & 0xff;
      a[16] = (baud >> 16) & 0xff;
      a[17] = (baud >> 24) & 0xff;
      a[18] = line_control;
      break;
    }
    case DEVICE_TYPE_RELAY_24: {
      for (let i = 1; i <= 24; i++) {
        const channel = get(`${id}/${DO}/${i}`);
        a[i] = (channel && channel.value) || 0;
      }
      const { is_rbus, baud, line_control } = get(`${id}/${RS485}/1`);
      a[25] = is_rbus;
      a[26] = (baud) & 0xff;
      a[27] = (baud >>  8) & 0xff;
      a[28] = (baud >> 16) & 0xff;
      a[29] = (baud >> 24) & 0xff;
      a[30] = line_control;
      break;
    }
    case DEVICE_TYPE_DIM4:
    case DEVICE_TYPE_DIM_4: {
      for (let i = 1; i <= 4; i++) {
        const channel = get(`${id}/${DIM}/${i}`);
        a[2 * i - 1] = (channel && channel.type) || 0;
        a[2 * i] = (channel && channel.value) || 0;
      }
      break;
    }
    case DEVICE_TYPE_DIM8:
    case DEVICE_TYPE_DIM_8: {
      for (let i = 1; i <= 8; i++) {
        const channel = get(`${id}/${DIM}/${i}`);
        a[2 * i - 1] = (channel && channel.type) || 0;
        a[2 * i] = (channel && channel.value) || 0;
      }
      break;
    }
    case DEVICE_TYPE_PLC: {
      for (let i = 1; i <= 36; i++) {
        const channel = get(`${id}/${DI}/${i}`);
        a[i] = (channel && channel.value) || 0;
      }
      for (let i = 1; i <= 24; i++) {
        const channel = get(`${id}/${DO}/${i}`);
        a[i + 36] = (channel && channel.value) || 0;
      }
      break;
    }
    case DEVICE_TYPE_ARTNET: {
      const { host, port, net, subnet, universe, rate, size = 0 } = dev;
      const config = { host, port, net, subnet, universe, rate };
      a[1] = (size << 8) & 0xff;
      a[2] = size & 0xff;
      for (let i = 1; i <= size; i++) {
        const channel = get(`${id}/${ARTNET}/${i}`);
        a[2 * i + 1] = (channel && channel.type) || 0;
        a[2 * i + 2] = (channel && channel.value) || 0;
      }
      confirm(id, Buffer.concat([
        Buffer.from(a),
        Buffer.from(JSON.stringify(config))
      ]))
      return;
    }
    default: {
      console.log('ops');
      set(id, { initialized: true });
      return;
    }
  }
  confirm(id, Buffer.from(a));
};
