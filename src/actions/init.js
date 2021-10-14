const {
  IR,
  DO,
  DI,
  DIM,
  GROUP,
  RS485,
  ARTNET,
  ACTION_INITIALIZE,
  DEVICE,
  DEVICE_PORT,
  DEVICE_TYPE_DO8,
  DEVICE_TYPE_DO12,
  DEVICE_TYPE_RELAY_2,
  DEVICE_TYPE_RELAY_2_DIN,
  DEVICE_TYPE_RELAY_6,
  DEVICE_TYPE_RELAY_12,
  DEVICE_TYPE_RELAY_24,
  DEVICE_TYPE_DI24,
  DEVICE_TYPE_DIM4,
  DEVICE_TYPE_DIM_4,
  DEVICE_TYPE_DIM8,
  DEVICE_TYPE_DIM_8,
  DEVICE_TYPE_ARTNET,
  DEVICE_TYPE_SMART_4G,
  DEVICE_TYPE_SMART_4GD,
  DEVICE_TYPE_SMART_4A,
  DEVICE_TYPE_SENSOR4,
  DEVICE_TYPE_PLC,
  DISCOVERY_INTERVAL,
  DEVICE_TYPE_MIX_1,
  DEVICE_TYPE_MIX_2,
  DEVICE_TYPE_IR_4,
  TV,
  ACTION_RBUS_TRANSMIT,
  DEVICE_TYPE_LANAMP,
  AO,
  DEVICE_TYPE_AO_4_DIN,
} = require("../constants");
const { get, set, add } = require("./create");
const { device } = require("../sockets");
const mac = require("../mac");
const { codes } = require("reacthome-ircodes");
const { ip2int } = require("../util");

module.exports.initialized = (id) => {
  set(id, { initialized: true });
};

const confirm = (id, data) => {
  const { ip } = get(id);
  device.send(data, ip);
};

module.exports.initialize = (id) => {
  add(mac(), DEVICE, id);
  set(id, { initialized: false });
  const dev = get(id);
  const a = [ACTION_INITIALIZE];
  switch (dev.type) {
    case DEVICE_TYPE_SENSOR4: {
      for (let i = 1; i <= 4; i++) {
        const channel = get(`${id}/di/${i}`);
        a[i] = (channel && channel.value) || 0;
      }
      break;
    }
    case DEVICE_TYPE_SMART_4G: {
      const mac = id.split(":").map((i) => parseInt(i, 16));
      a[0] = ACTION_RBUS_TRANSMIT;
      a[1] = mac[0];
      a[2] = mac[1];
      a[3] = mac[2];
      a[4] = mac[3];
      a[5] = mac[4];
      a[6] = mac[5];
      a[7] = ACTION_INITIALIZE;
      for (let i = 1; i <= 4; i++) {
        const channel = get(`${id}/rgb/${i}`);
        a[3 * i + 5] = (channel && channel.r) || 0;
        a[3 * i + 6] = (channel && channel.g) || 0;
        a[3 * i + 7] = (channel && channel.b) || 0;
      }
      break;
    }
    case DEVICE_TYPE_SMART_4GD: {
      const mac = id.split(":").map((i) => parseInt(i, 16));
      a[0] = ACTION_RBUS_TRANSMIT;
      a[1] = mac[0];
      a[2] = mac[1];
      a[3] = mac[2];
      a[4] = mac[3];
      a[5] = mac[4];
      a[6] = mac[5];
      a[7] = ACTION_INITIALIZE;
      for (let i = 1; i <= 4; i++) {
        const channel = get(`${id}/rgb/${i + 1}`);
        a[3 * i + 5] = (channel && channel.r) || 0;
        a[3 * i + 6] = (channel && channel.g) || 0;
        a[3 * i + 7] = (channel && channel.b) || 0;
      }
      const { image = [], level } = get(id);
      a[20] = level || 0;
      a[21] = image[0] || 0;
      a[22] = image[1] || 0;
      break;
    }
    case DEVICE_TYPE_SMART_4A: {
      const mac = id.split(":").map((i) => parseInt(i, 16));
      a[0] = ACTION_RBUS_TRANSMIT;
      a[1] = mac[0];
      a[2] = mac[1];
      a[3] = mac[2];
      a[4] = mac[3];
      a[5] = mac[4];
      a[6] = mac[5];
      a[7] = ACTION_INITIALIZE;
      for (let i = 1; i <= 5; i++) {
        const channel = get(`${id}/rgb/${i}`);
        a[3 * i + 5] = (channel && channel.r) || 0;
        a[3 * i + 6] = (channel && channel.g) || 0;
        a[3 * i + 7] = (channel && channel.b) || 0;
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
    case DEVICE_TYPE_IR_4: {
      const mac = id.split(":").map((i) => parseInt(i, 16));
      a[0] = ACTION_RBUS_TRANSMIT;
      a[1] = mac[0];
      a[2] = mac[1];
      a[3] = mac[2];
      a[4] = mac[3];
      a[5] = mac[4];
      a[6] = mac[5];
      a[7] = ACTION_INITIALIZE;
      const { version = "" } = get(id) || {};
      const [major, minor] = version.split(".");
      if (major >= 3) {
        for (let i = 1; i <= 4; i++) {
          const channel = get(`${id}/${IR}/${i}`) || {};
          const { bind } = channel;
          const { type, brand, model } = get(bind) || {};
          const {
            frequency,
            count = [],
            header = [],
            trail,
          } = ((codes[type] || {})[brand] || {})[model] || {};
          a[14 * i - 6] = frequency & 0xff;
          a[14 * i - 5] = (frequency >> 8) & 0xff;
          a[14 * i - 4] = count[0] & 0xff;
          a[14 * i - 3] = (count[0] >> 8) & 0xff;
          a[14 * i - 2] = count[1] & 0xff;
          a[14 * i - 1] = (count[1] >> 8) & 0xff;
          a[14 * i + 0] = count[2] & 0xff;
          a[14 * i + 1] = (count[2] >> 8) & 0xff;
          a[14 * i + 2] = header[0] & 0xff;
          a[14 * i + 3] = (header[0] >> 8) & 0xff;
          a[14 * i + 4] = header[1] & 0xff;
          a[14 * i + 5] = (header[1] >> 8) & 0xff;
          a[14 * i + 6] = trail & 0xff;
          a[14 * i + 7] = (trail >> 8) & 0xff;
        }
      } else {
        for (let i = 1; i <= 4; i++) {
          const channel = get(`${id}/${IR}/${i}`) || {};
          const { bind } = channel;
          const { type, brand, model } = get(bind) || {};
          const {
            frequency,
            count = [],
            header = [],
            trail,
          } = ((codes[type] || {})[brand] || {})[model] || {};
          a[12 * i - 4] = frequency & 0xff;
          a[12 * i - 3] = (frequency >> 8) & 0xff;
          a[12 * i - 2] = count[0] & 0xff;
          a[12 * i - 1] = (count[0] >> 8) & 0xff;
          a[12 * i + 0] = count[1] & 0xff;
          a[12 * i + 1] = (count[1] >> 8) & 0xff;
          a[12 * i + 2] = header[0] & 0xff;
          a[12 * i + 3] = (header[0] >> 8) & 0xff;
          a[12 * i + 4] = header[1] & 0xff;
          a[12 * i + 5] = (header[1] >> 8) & 0xff;
          a[12 * i + 6] = trail & 0xff;
          a[12 * i + 7] = (trail >> 8) & 0xff;
        }
      }
      break;
    }
    case DEVICE_TYPE_RELAY_2:
    case DEVICE_TYPE_RELAY_2_DIN: {
      const { version = "" } = get(id) || {};
      const [major, minor] = version.split(".");
      const mac = id.split(":").map((i) => parseInt(i, 16));
      a[0] = ACTION_RBUS_TRANSMIT;
      a[1] = mac[0];
      a[2] = mac[1];
      a[3] = mac[2];
      a[4] = mac[3];
      a[5] = mac[4];
      a[6] = mac[5];
      a[7] = ACTION_INITIALIZE;
      if (major >= 2) {
        for (let i = 1; i <= 1; i++) {
          const channel = get(`${id}/${GROUP}/${i}`) || {};
          const { value = 0, delay = 0 } = channel;
          a[5 * i + 3] = value;
          a[5 * i + 4] = delay & 0xff;
          a[5 * i + 5] = (delay >> 8) & 0xff;
          a[5 * i + 6] = (delay >> 16) & 0xff;
          a[5 * i + 7] = (delay >> 24) & 0xff;
        }
        for (let i = 1; i <= 2; i++) {
          const channel = get(`${id}/${DO}/${i}`) || {};
          const { value = 0, timeout = 0 } = channel;
          a[5 * i + 8] = value;
          a[5 * i + 9] = timeout & 0xff;
          a[5 * i + 10] = (timeout >> 8) & 0xff;
          a[5 * i + 11] = (timeout >> 16) & 0xff;
          a[5 * i + 12] = (timeout >> 24) & 0xff;
        }
      } else {
        for (let i = 1; i <= 2; i++) {
          const channel = get(`${id}/${DO}/${i}`);
          a[i + 7] = (channel && channel.value) || 0;
        }
      }
      break;
    }
    case DEVICE_TYPE_MIX_1:
    case DEVICE_TYPE_MIX_2:
    case DEVICE_TYPE_RELAY_6: {
      const { version = "" } = get(id) || {};
      const [major, minor] = version.split(".");
      if (major >= 2) {
        for (let i = 1; i <= 3; i++) {
          const channel = get(`${id}/${GROUP}/${i}`) || {};
          const { value = 0, delay = 0 } = channel;
          a[5 * i - 4] = value;
          a[5 * i - 3] = delay & 0xff;
          a[5 * i - 2] = (delay >> 8) & 0xff;
          a[5 * i - 1] = (delay >> 16) & 0xff;
          a[5 * i - 0] = (delay >> 24) & 0xff;
        }
        for (let i = 1; i <= 6; i++) {
          const channel = get(`${id}/${DO}/${i}`) || {};
          const { value = 0, timeout = 0 } = channel;
          a[5 * i + 11] = value;
          a[5 * i + 12] = timeout & 0xff;
          a[5 * i + 13] = (timeout >> 8) & 0xff;
          a[5 * i + 14] = (timeout >> 16) & 0xff;
          a[5 * i + 15] = (timeout >> 24) & 0xff;
        }
        const {
          is_rbus = true,
          baud,
          line_control,
        } = get(`${id}/${RS485}/1`) || {};
        a[46] = is_rbus;
        a[47] = baud & 0xff;
        a[48] = (baud >> 8) & 0xff;
        a[49] = (baud >> 16) & 0xff;
        a[50] = (baud >> 24) & 0xff;
        a[51] = line_control;
      } else {
        for (let i = 1; i <= 6; i++) {
          const channel = get(`${id}/${DO}/${i}`);
          a[i] = (channel && channel.value) || 0;
        }
        const {
          is_rbus = true,
          baud,
          line_control,
        } = get(`${id}/${RS485}/1`) || {};
        a[7] = is_rbus;
        a[8] = baud & 0xff;
        a[9] = (baud >> 8) & 0xff;
        a[10] = (baud >> 16) & 0xff;
        a[11] = (baud >> 24) & 0xff;
        a[12] = line_control;
      }
      break;
    }
    case DEVICE_TYPE_RELAY_12: {
      const { version = "" } = get(id) || {};
      const [major, minor] = version.split(".");
      if (major >= 2) {
        for (let i = 1; i <= 6; i++) {
          const channel = get(`${id}/${GROUP}/${i}`) || {};
          const { value = 0, delay = 0 } = channel;
          a[5 * i - 4] = value;
          a[5 * i - 3] = delay & 0xff;
          a[5 * i - 2] = (delay >> 8) & 0xff;
          a[5 * i - 1] = (delay >> 16) & 0xff;
          a[5 * i - 0] = (delay >> 24) & 0xff;
        }
        for (let i = 1; i <= 12; i++) {
          const channel = get(`${id}/${DO}/${i}`) || {};
          const { value = 0, timeout = 0 } = channel;
          a[5 * i + 26] = value;
          a[5 * i + 27] = timeout & 0xff;
          a[5 * i + 28] = (timeout >> 8) & 0xff;
          a[5 * i + 29] = (timeout >> 16) & 0xff;
          a[5 * i + 30] = (timeout >> 24) & 0xff;
        }
        const {
          is_rbus = true,
          baud,
          line_control,
        } = get(`${id}/${RS485}/1`) || {};
        a[91] = is_rbus;
        a[92] = baud & 0xff;
        a[93] = (baud >> 8) & 0xff;
        a[94] = (baud >> 16) & 0xff;
        a[95] = (baud >> 24) & 0xff;
        a[96] = line_control;
      } else {
        for (let i = 1; i <= 12; i++) {
          const channel = get(`${id}/${DO}/${i}`);
          a[i] = (channel && channel.value) || 0;
        }
        const {
          is_rbus = true,
          baud,
          line_control,
        } = get(`${id}/${RS485}/1`) || {};
        a[13] = is_rbus;
        a[14] = baud & 0xff;
        a[15] = (baud >> 8) & 0xff;
        a[16] = (baud >> 16) & 0xff;
        a[17] = (baud >> 24) & 0xff;
        a[18] = line_control;
      }
      break;
    }
    case DEVICE_TYPE_RELAY_24: {
      for (let i = 1; i <= 24; i++) {
        const channel = get(`${id}/${DO}/${i}`);
        a[i] = (channel && channel.value) || 0;
      }
      const {
        is_rbus = true,
        baud,
        line_control,
      } = get(`${id}/${RS485}/1`) || {};
      a[25] = is_rbus;
      a[26] = baud & 0xff;
      a[27] = (baud >> 8) & 0xff;
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
    case DEVICE_TYPE_AO_4_DIN: {
      const mac = id.split(":").map((i) => parseInt(i, 16));
      a[0] = ACTION_RBUS_TRANSMIT;
      a[1] = mac[0];
      a[2] = mac[1];
      a[3] = mac[2];
      a[4] = mac[3];
      a[5] = mac[4];
      a[6] = mac[5];
      a[7] = ACTION_INITIALIZE;
      for (let i = 1; i <= 4; i++) {
        const channel = get(`${id}/${AO}/${i}`) || {};
        a[i + 7] = channel.value || 0;
      }
      break;
    }
    case DEVICE_TYPE_LANAMP: {
      for (let i = 0; i < 2; i++) {
        const index = i + 1;
        const { mode, volume = [] } = get(`${id}/lanamp/${index}`) || {};
        let source = [[], []];
        switch (mode) {
          case 0b01:
          case 0b10: {
            const zone = get(`${id}/stereo/${index}`);
            source[0] = zone.source || [];
            break;
          }
          case 0b11: {
            const zone0 = get(`${id}/mono/${2 * index - 1}`);
            source[0] = zone0.source || [];
            const zone1 = get(`${id}/mono/${2 * index}`);
            source[1] = zone1.source || [];
            break;
          }
        }
        a[23 * i + 1] = mode;
        for (let j = 0; j < 2; j++) {
          a[23 * i + j + 2] = volume[j];
          for (let k = 0; k < 5; k++) {
            const { active = 0, volume = 0 } = source[j][k] || {};
            a[23 * i + j * 5 + k + 4] = active;
            a[23 * i + j * 5 + k + 4 + 5 * 2] = volume;
          }
        }
      }
      for (let i = 0; i < 4; i++) {
        const index = i + 1;
        const {
          active,
          group = "",
          port = 0,
        } = get(`${id}/rtp/${index}`) || {};
        const ip = ip2int(group);
        a[47 + i * 7] = active;
        a[48 + i * 7] = (ip >> 24) & 0xff;
        a[49 + i * 7] = (ip >> 16) & 0xff;
        a[50 + i * 7] = (ip >> 8) & 0xff;
        a[51 + i * 7] = ip & 0xff;
        a[52 + i * 7] = (port >> 8) & 0xff;
        a[53 + i * 7] = port & 0xff;
      }
      for (let i = 0; i < 4; i++) {
        const channel = get(`${id}/${IR}/${i + 1}`) || {};
        const { bind } = channel;
        const { type, brand, model } = get(bind) || {};
        const {
          frequency,
          count = [],
          header = [],
          trail,
        } = ((codes[type] || {})[brand] || {})[model] || {};
        a[14 * i + 75] = frequency & 0xff;
        a[14 * i + 76] = (frequency >> 8) & 0xff;
        a[14 * i + 77] = count[0] & 0xff;
        a[14 * i + 78] = (count[0] >> 8) & 0xff;
        a[14 * i + 79] = count[1] & 0xff;
        a[14 * i + 80] = (count[1] >> 8) & 0xff;
        a[14 * i + 81] = count[2] & 0xff;
        a[14 * i + 82] = (count[2] >> 8) & 0xff;
        a[14 * i + 83] = header[0] & 0xff;
        a[14 * i + 84] = (header[0] >> 8) & 0xff;
        a[14 * i + 85] = header[1] & 0xff;
        a[14 * i + 86] = (header[1] >> 8) & 0xff;
        a[14 * i + 87] = trail & 0xff;
        a[14 * i + 88] = (trail >> 8) & 0xff;
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
      confirm(
        id,
        Buffer.concat([Buffer.from(a), Buffer.from(JSON.stringify(config))])
      );
      return;
    }
    default: {
      set(id, { initialized: true });
      return;
    }
  }
  confirm(id, Buffer.from(a));
};
