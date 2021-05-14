const { CronJob } = require("cron");
const { exists, createWriteStream } = require("fs");
const fetch = require("node-fetch");
const crypto = require("crypto");
const color = require("color-convert");
const ircodes = require("reacthome-ircodes");
const drivers = require("../drivers");
const {
  VERSION,
  AC,
  TV,
  DO,
  DIM,
  GROUP,
  ARTNET,
  ACTION_DO,
  ACTION_GROUP,
  ACTION_DI_RELAY_SYNC,
  ACTION_DOPPLER,
  ACTION_DIMMER,
  ACTION_ARTNET,
  ACTION_DISCOVERY,
  ACTION_FIND_ME,
  ACTION_BOOTLOAD,
  ACTION_INIT,
  ACTION_SET,
  ACTION_ASSET,
  ACTION_DOWNLOAD,
  ACTION_RGB,
  ACTION_IR,
  ACTION_IR_CONFIG,
  ACTION_RGB_DIM,
  ACTION_ON,
  ACTION_OFF,
  ACTION_RS485_MODE,
  ACTION_RBUS_TRANSMIT,
  ACTION_DIM,
  ACTION_ENABLE,
  ACTION_DISABLE,
  ACTION_DIM_RELATIVE,
  ACTION_SITE_LIGHT_DIM_RELATIVE,
  ACTION_SITE_LIGHT_OFF,
  ACTION_SETPOINT,
  ACTION_TIMER_START,
  ACTION_TIMER_STOP,
  ACTION_SCHEDULE_START,
  ACTION_SCHEDULE_STOP,
  ACTION_CLOCK_START,
  ACTION_CLOCK_STOP,
  ACTION_CLOCK_TEST,
  ACTION_NIGHT_TEST,
  ACTION_DAY_TEST,
  ACTION_DOPPLER_HANDLE,
  ACTION_THERMOSTAT_HANDLE,
  ACTION_LIMIT_HEATING_HANDLE,
  ACTION_TOGGLE,
  ACTION_TV,
  ACTION_LEAKAGE_RESET,
  ACTION_SCRIPT_RUN,
  ACTION_MOVE_TO_HUE,
  ACTION_MOVE_TO_SATURATION,
  ACTION_MOVE_TO_HUE_SATURATION,
  ACTION_MOVE_TO_LEVEL,
  DEVICE_PORT,
  DEVICE_TYPE_DIM4,
  DEVICE_TYPE_DIM_4,
  DEVICE_TYPE_DIM8,
  DEVICE_TYPE_DIM_8,
  DEVICE_TYPE_RELAY_2,
  DEVICE_TYPE_RELAY_2_DIN,
  DEVICE_TYPE_RELAY_6,
  DEVICE_TYPE_RELAY_12,
  DEVICE_TYPE_RELAY_24,
  DEVICE_TYPE_IR_4,
  DEVICE_TYPE_SENSOR4,
  DEVICE_TYPE_SMART_4,
  DRIVER_TYPE_ARTNET,
  DRIVER_TYPE_BB_PLC1,
  DRIVER_TYPE_BB_PLC2,
  DRIVER_TYPE_INTESIS_BOX,
  DISCOVERY_INTERVAL,
  DAEMON,
  MOBILE,
  DEVICE,
  SERVICE,
  CLIENT_PORT,
  CLIENT_GROUP,
  ON,
  OFF,
  DIM_ON,
  DIM_OFF,
  DIM_SET,
  DIM_FADE,
  DIM_TYPE,
  DIM_TYPE_RELAY,
  DIM_TYPE_FALLING_EDGE,
  DIM_TYPE_RISING_EDGE,
  DIM_TYPE_PWM,
  ARTNET_ON,
  ARTNET_OFF,
  ARTNET_SET,
  ARTNET_FADE,
  ARTNET_CONFIG,
  ARTNET_TYPE,
  ARTNET_TYPE_DIMMER,
  ARTNET_TYPE_RELAY,
  ARTNET_TYPE_PWM,
  ACTION_PNP,
  PNP_ENABLE,
  PNP_STEP,
  OPERATOR_PLUS,
  OPERATOR_MINUS,
  OPERATOR_MUL,
  OPERATOR_DIV,
  OPERATOR_LT,
  OPERATOR_LE,
  OPERATOR_EQ,
  OPERATOR_NE,
  OPERATOR_GE,
  OPERATOR_GT,
  STATE,
  STOP,
  HEAT,
  COOL,
  LIGHT_RGB,
  COLOR,
  MOVE_TO_LEVEL,
  MOVE_TO_HUE_SATURATION,
  CLOSURE,
  CLOSE,
  OPEN,
  START,
  ACTION_OPEN,
  ACTION_STOP,
  ACTION_CLOSE,
  CLOSE_OPEN,
  ACTION_SET_ADDRESS,
  ACTION_SET_FAN_SPEED,
  ACTION_SET_DIRECTION,
  ACTION_SET_MODE,
  DRIVER_TYPE_VARMANN,
  DEVICE_TYPE_MIX_2,
  IR,
  ACTION_LANAMP,
} = require("../constants");
const { LIST } = require("../init/constants");
const { NOTIFY } = require("../notification/constants");
const notification = require("../notification");
const {
  get,
  set,
  add,
  offline,
  online,
  applySite,
  pendingFirmware,
  updateFirmware,
} = require("../actions");
const { device } = require("../sockets");
const mac = require("../mac");
const { ac } = require("../drivers");
const { broadcast } = require("../websocket/peer");
const { ZIGBEE } = require("../zigbee/constants");
const zigbee = require("../zigbee/out");
const { asset, writeFile } = require("../fs");
const { RING } = require("../ring/constants");

const timers = {};
const schedules = {};

const DIM_VELOCITY = 128;
const ARTNET_VELOCITY = 1;

const bind = ["r", "g", "b", "bind"];
const rgb = ["r", "g", "b"];

const run = (action) => {
  try {
    switch (action.type) {
      case ACTION_SET: {
        const { id, payload } = action;
        set(id, payload);
        const [dev, type, index] = id.split("/");
        if (type === IR) {
          const { type, version, ip } = get(dev) || {};
          if (type === DEVICE_TYPE_IR_4) {
            const [major] = version.split(".");
            if (parseInt(major) < 2) return;
            const { bind } = get(id) || {};
            const { type, brand, model } = get(bind) || {};
            const {
              frequency,
              count = [],
              header = [],
              trail,
            } = ((ircodes.codes[type] || {})[brand] || {})[model] || {};
            const buffer = Buffer.alloc(21);
            buffer.writeUInt8(ACTION_RBUS_TRANSMIT, 0);
            dev
              .split(":")
              .forEach((t, i) => buffer.writeUInt8(parseInt(t, 16), i + 1));
            buffer.writeUInt8(ACTION_IR_CONFIG, 7);
            buffer.writeUInt8(index, 8);
            buffer.writeUInt16LE(frequency, 9);
            buffer.writeUInt16LE(count[0], 11);
            buffer.writeUInt16LE(count[1], 13);
            buffer.writeUInt16LE(header[0], 15);
            buffer.writeUInt16LE(header[1], 17);
            buffer.writeUInt16LE(trail, 19);
            device.send(buffer, ip);
          }
        }
        break;
      }
      case ACTION_ASSET: {
        const { name, payload } = action;
        writeFile(asset(name), Buffer.from(payload, "base64"))
          .then(() => {
            broadcast({ type: LIST, assets: [name] });
          })
          .catch(console.error);
        break;
      }
      case ACTION_FIND_ME: {
        const dev = get(action.id);
        device.send(Buffer.from([ACTION_FIND_ME, action.finding]), dev.ip);
        break;
      }
      case ACTION_OPEN:
      case ACTION_STOP:
      case ACTION_CLOSE: {
        const o = get(action.id) || {};
        if (o.disabled) return;
        if (o.bind) {
          const [dev, type, index] = o.bind.split("/");
          const { protocol } = get(dev) || {};
          if (protocol === ZIGBEE) {
            zigbee.closure(dev, index, action.type);
            const script = {
              [ACTION_OPEN]: "onOpen",
              [ACTION_CLOSE]: "onClose",
              [ACTION_STOP]: "onStop",
            }[action.type];
            if (o[script]) {
              run({ type: ACTION_SCRIPT_RUN, id: o[script] });
            }
          } else if (type === GROUP) {
            run({ type: ACTION_DO, id: dev, index, value: action.type });
          }
        }
        break;
      }
      case ACTION_DO: {
        const dev = get(action.id);
        if (dev.protocol === ZIGBEE) {
          zigbee.on_off(action.id, action.index, action.value);
          return;
        }
        const id = `${action.id}/${DO}/${action.index}`;
        switch (dev.type) {
          case DRIVER_TYPE_BB_PLC1:
          case DRIVER_TYPE_BB_PLC2: {
            drivers.handle(action);
            break;
          }
          case DEVICE_TYPE_RELAY_2:
          case DEVICE_TYPE_RELAY_2_DIN: {
            switch (action.value) {
              case ACTION_OPEN:
              case ACTION_CLOSE:
              case ACTION_STOP: {
                const group = get(`${action.id}/${GROUP}/${action.index}`);
                if (!group || !group.enabled) return;
                switch (action.value) {
                  case ACTION_STOP: {
                    device.send(
                      Buffer.from([
                        ACTION_RBUS_TRANSMIT,
                        ...action.id.split(":").map((i) => parseInt(i, 16)),
                        ACTION_DO,
                        2 * action.index - 1,
                        0,
                      ]),
                      dev.ip
                    );
                    device.send(
                      Buffer.from([
                        ACTION_RBUS_TRANSMIT,
                        ...action.id.split(":").map((i) => parseInt(i, 16)),
                        ACTION_DO,
                        2 * action.index,
                        0,
                      ]),
                      dev.ip
                    );
                    break;
                  }
                  case ACTION_OPEN: {
                    if (group.type === CLOSE_OPEN) {
                      device.send(
                        Buffer.from([
                          ACTION_RBUS_TRANSMIT,
                          ...action.id.split(":").map((i) => parseInt(i, 16)),
                          ACTION_DO,
                          2 * action.index,
                          1,
                        ]),
                        dev.ip
                      );
                    } else {
                      device.send(
                        Buffer.from([
                          ACTION_RBUS_TRANSMIT,
                          ...action.id.split(":").map((i) => parseInt(i, 16)),
                          ACTION_DO,
                          2 * action.index - 1,
                          1,
                        ]),
                        dev.ip
                      );
                    }
                    break;
                  }
                  case ACTION_CLOSE: {
                    if (group.type === CLOSE_OPEN) {
                      device.send(
                        Buffer.from([
                          ACTION_RBUS_TRANSMIT,
                          ...action.id.split(":").map((i) => parseInt(i, 16)),
                          ACTION_DO,
                          2 * action.index - 1,
                          1,
                        ]),
                        dev.ip
                      );
                    } else {
                      device.send(
                        Buffer.from([
                          ACTION_RBUS_TRANSMIT,
                          ...action.id.split(":").map((i) => parseInt(i, 16)),
                          ACTION_DO,
                          2 * action.index,
                          1,
                        ]),
                        dev.ip
                      );
                    }
                    break;
                  }
                }
                break;
              }
              default: {
                const a = [
                  ACTION_RBUS_TRANSMIT,
                  ...action.id.split(":").map((i) => parseInt(i, 16)),
                  ACTION_DO,
                  action.index,
                ];
                if (action.value !== undefined) {
                  a.push(action.value);
                }
                if (action.timeout !== undefined) {
                  a.push(action.timeout & 0xff);
                  a.push((action.timeout >> 8) & 0xff);
                  a.push((action.timeout >> 16) & 0xff);
                  a.push((action.timeout >> 24) & 0xff);
                }
                device.send(Buffer.from(a), dev.ip);
              }
            }
            break;
          }
          case DEVICE_TYPE_MIX_2:
          case DEVICE_TYPE_RELAY_6:
          case DEVICE_TYPE_RELAY_12: {
            const { version = "" } = dev;
            const [major, minor] = version.split(".");
            if (major >= 2) {
              switch (action.value) {
                case ACTION_OPEN:
                case ACTION_CLOSE:
                case ACTION_STOP: {
                  const group = get(`${action.id}/${GROUP}/${action.index}`);
                  if (!group || !group.enabled) return;
                  switch (action.value) {
                    case ACTION_STOP: {
                      device.send(
                        Buffer.from([ACTION_DO, 2 * action.index - 1, 0]),
                        dev.ip
                      );
                      device.send(
                        Buffer.from([ACTION_DO, 2 * action.index, 0]),
                        dev.ip
                      );
                      break;
                    }
                    case ACTION_OPEN: {
                      if (group.type === CLOSE_OPEN) {
                        device.send(
                          Buffer.from([ACTION_DO, 2 * action.index, 1]),
                          dev.ip
                        );
                      } else {
                        device.send(
                          Buffer.from([ACTION_DO, 2 * action.index - 1, 1]),
                          dev.ip
                        );
                      }
                      break;
                    }
                    case ACTION_CLOSE: {
                      if (group.type === CLOSE_OPEN) {
                        device.send(
                          Buffer.from([ACTION_DO, 2 * action.index - 1, 1]),
                          dev.ip
                        );
                      } else {
                        device.send(
                          Buffer.from([ACTION_DO, 2 * action.index, 1]),
                          dev.ip
                        );
                      }
                      break;
                    }
                  }
                  break;
                }
                default: {
                  const a = [ACTION_DO, action.index];
                  if (action.value !== undefined) {
                    a.push(action.value);
                  }
                  if (action.timeout !== undefined) {
                    a.push(action.timeout & 0xff);
                    a.push((action.timeout >> 8) & 0xff);
                    a.push((action.timeout >> 16) & 0xff);
                    a.push((action.timeout >> 24) & 0xff);
                  }
                  device.send(Buffer.from(a), dev.ip);
                }
              }
            } else {
              device.send(
                Buffer.from([ACTION_DO, action.index, action.value]),
                dev.ip
              );
            }
            break;
          }
          default: {
            device.send(
              Buffer.from([ACTION_DO, action.index, action.value]),
              dev.ip
            );
          }
        }
        break;
      }
      case ACTION_GROUP: {
        const dev = get(action.id);
        const group = `${action.id}/${GROUP}/${action.index}`;
        const buffer = Buffer.alloc(7);
        const { enabled, delay } = get(group) || {};
        buffer.writeUInt8(ACTION_GROUP, 0);
        buffer.writeUInt8(action.index, 1);
        buffer.writeUInt8(
          action.enabled === undefined ? enabled : action.enabled,
          2
        );
        buffer.writeUInt32LE(
          action.delay === undefined ? delay : action.delay,
          3
        );
        switch (dev.type) {
          case DEVICE_TYPE_RELAY_2_DIN:
          case DEVICE_TYPE_RELAY_2:
            device.send(
              Buffer.concat([
                Buffer.from([
                  ACTION_RBUS_TRANSMIT,
                  ...action.id.split(":").map((i) => parseInt(i, 16)),
                ]),
                buffer,
              ]),
              dev.ip
            );
            break;
          default:
            device.send(buffer, dev.ip);
        }
        break;
      }
      case ACTION_DI_RELAY_SYNC: {
        const dev = get(action.id);
        switch (dev.type) {
          case DEVICE_TYPE_RELAY_2_DIN: {
            device.send(
              Buffer.from([
                ACTION_RBUS_TRANSMIT,
                ...action.id.split(":").map((i) => parseInt(i, 16)),
                ACTION_DI_RELAY_SYNC,
                action.index,
                ...action.value[0],
                ...action.value[1],
              ]),
              dev.ip
            );
            break;
          }
          default:
            device.send(
              Buffer.from([
                ACTION_DI_RELAY_SYNC,
                action.index,
                ...action.value[0],
                ...action.value[1],
              ]),
              dev.ip
            );
        }
        break;
      }
      case ACTION_DOPPLER: {
        const dev = get(action.id);
        device.send(Buffer.from([ACTION_DOPPLER, action.gain]), dev.ip);
        break;
      }
      case ACTION_DIMMER: {
        const dev = get(action.id) || {};
        let velocity = DIM_VELOCITY;
        if (dev.type === DRIVER_TYPE_ARTNET) {
          velocity = ARTNET_VELOCITY;
        }
        switch (action.action) {
          case DIM_SET:
            device.send(
              Buffer.from([
                ACTION_DIMMER,
                action.index,
                action.action,
                action.value,
              ]),
              dev.ip
            );
            break;
          case DIM_TYPE:
            device.send(
              Buffer.from([
                ACTION_DIMMER,
                action.index,
                action.action,
                action.value,
              ]),
              dev.ip
            );
            break;
          case DIM_FADE:
            device.send(
              Buffer.from([
                ACTION_DIMMER,
                action.index,
                action.action,
                action.value,
                velocity,
              ]),
              dev.ip
            );
            break;
          case DIM_ON:
            device.send(
              Buffer.from([ACTION_DIMMER, action.index, action.action]),
              dev.ip
            );
            break;
          case DIM_OFF:
            device.send(
              Buffer.from([ACTION_DIMMER, action.index, action.action]),
              dev.ip
            );
            break;
        }
        break;
      }
      case ACTION_MOVE_TO_HUE: {
        const dev = get(action.id) || {};
        if (dev.protocol === ZIGBEE) {
          zigbee.move_to_hue(action.id, action.index, action.value);
        }
        break;
      }
      case ACTION_MOVE_TO_SATURATION: {
        const dev = get(action.id) || {};
        if (dev.protocol === ZIGBEE) {
          zigbee.move_to_saturation(action.id, action.index, action.value);
        }
        break;
      }
      case ACTION_MOVE_TO_LEVEL: {
        const dev = get(action.id) || {};
        if (dev.protocol === ZIGBEE) {
          zigbee.move_to_level(action.id, action.index, action.value);
        }
        break;
      }
      case ACTION_ARTNET: {
        drivers.handle(action);
        break;
      }
      case ACTION_PNP: {
        const dev = get(action.id);
        set(action.id, { t0: Date.now() });
        switch (action.action) {
          case PNP_ENABLE:
            device.send(
              Buffer.from([ACTION_PNP, PNP_ENABLE, action.enabled]),
              dev.ip
            );
            break;
          case PNP_STEP:
            const buff = Buffer.alloc(5);
            buff.writeUInt8(ACTION_PNP, 0);
            buff.writeUInt8(PNP_STEP, 1);
            buff.writeUInt8(action.direction, 2);
            buff.writeUInt16BE(action.step, 3);
            device.send(buff, dev.ip);
            break;
        }
        break;
      }
      case ACTION_RGB_DIM: {
        const { id, value = {} } = action;
        const { r, g, b } = value;
        const o = get(id) || {};
        const { ip, type } = o;
        switch (type) {
          case DEVICE_TYPE_SENSOR4: {
            device.send(Buffer.from([ACTION_RGB, 0, r, g, b]), ip);
            break;
          }
          case DEVICE_TYPE_SMART_4: {
            device.send(
              Buffer.from([
                ACTION_RBUS_TRANSMIT,
                ...action.id.split(":").map((i) => parseInt(i, 16)),
                ACTION_RGB,
                0,
                r,
                g,
                b,
              ]),
              ip
            );
            break;
          }
          case LIGHT_RGB: {
            set(id, { last: { r, g, b } });
            rgb.forEach((i) => {
              if (!o[i]) return;
              const { velocity } = get(o[i]) || {};
              const [dev, , index] = o[i].split("/");
              const { ip, type: deviceType } = get(dev);
              const v = value[i];
              switch (deviceType) {
                case DEVICE_TYPE_DIM4:
                case DEVICE_TYPE_DIM_4:
                case DEVICE_TYPE_DIM8:
                case DEVICE_TYPE_DIM_8: {
                  device.send(
                    Buffer.from([
                      ACTION_DIMMER,
                      index,
                      DIM_FADE,
                      v,
                      DIM_VELOCITY,
                    ]),
                    ip
                  );
                  break;
                }
                case DRIVER_TYPE_ARTNET: {
                  drivers.handle({
                    id: dev,
                    index,
                    action: ARTNET_FADE,
                    v,
                    velocity: ARTNET_VELOCITY,
                  });
                  break;
                }
              }
            });
            break;
          }
        }
        break;
      }
      case ACTION_ENABLE: {
        const { type } = get(action.id) || {};
        switch (type) {
          case AC: {
            ac.handle(action);
            break;
          }
          default: {
            set(action.id, { disabled: false });
          }
        }
        break;
      }
      case ACTION_ON: {
        const { id } = action;
        const o = get(id) || {};
        if (o.disabled) return;
        if (o.type === DRIVER_TYPE_INTESIS_BOX) {
          drivers.handle(action);
          return;
        }
        set(id, { value: true });
        if (o.onOn) {
          run({ type: ACTION_SCRIPT_RUN, id: o.onOn });
        }
        const { last = {}, type: payloadType } = o;
        const isOn = last.r > 0 || last.g > 0 || last.b > 0 || last.value > 0;
        bind.forEach((i) => {
          if (!o[i]) return;
          const { velocity, type } = get(o[i]) || {};
          const [dev, , index] = o[i].split("/");
          const { ip, type: deviceType, protocol } = get(dev);
          if (protocol === ZIGBEE) {
            zigbee.on(dev, index);
            return;
          }
          const value = isOn ? (i === "bind" ? last.value : last[i]) : 255;
          switch (deviceType) {
            case DEVICE_TYPE_DIM4:
            case DEVICE_TYPE_DIM_4:
            case DEVICE_TYPE_DIM8:
            case DEVICE_TYPE_DIM_8: {
              switch (type) {
                case DIM_TYPE_PWM:
                case DIM_TYPE_RISING_EDGE:
                case DIM_TYPE_FALLING_EDGE: {
                  device.send(
                    Buffer.from([
                      ACTION_DIMMER,
                      index,
                      DIM_FADE,
                      value,
                      DIM_VELOCITY,
                    ]),
                    ip
                  );
                  break;
                }
                default: {
                  device.send(Buffer.from([ACTION_DO, index, ON]), ip);
                }
              }
              break;
            }
            case DEVICE_TYPE_RELAY_2:
            case DEVICE_TYPE_RELAY_2_DIN: {
              device.send(
                Buffer.from([
                  ACTION_RBUS_TRANSMIT,
                  ...dev.split(":").map((i) => parseInt(i, 16)),
                  ACTION_DO,
                  index,
                  ON,
                ]),
                ip
              );
              break;
            }
            case DRIVER_TYPE_ARTNET: {
              switch (type) {
                case ARTNET_TYPE_DIMMER:
                  drivers.handle({
                    id: dev,
                    index,
                    action: ARTNET_FADE,
                    value,
                    velocity: ARTNET_VELOCITY,
                  });
                  break;
                default:
                  drivers.handle({
                    id: dev,
                    index,
                    type: ACTION_DO,
                    value: ON,
                    velocity: ARTNET_VELOCITY,
                  });
              }
              break;
            }
            case DRIVER_TYPE_BB_PLC1:
            case DRIVER_TYPE_BB_PLC2: {
              drivers.handle({ id: dev, index, value: ON });
              break;
            }
            default: {
              switch (payloadType) {
                case AC: {
                  ac.handle(action);
                  break;
                }
                default: {
                  device.send(Buffer.from([ACTION_DO, index, ON]), ip);
                }
              }
            }
          }
        });
        break;
      }
      case ACTION_DISABLE: {
        const { type } = get(action.id) || {};
        switch (type) {
          case AC: {
            ac.handle(action);
            break;
          }
          default: {
            set(action.id, { disabled: true });
          }
        }
        break;
      }
      case ACTION_OFF: {
        const { id } = action;
        const o = get(id) || {};
        if (o.disabled) return;
        if (o.type === DRIVER_TYPE_INTESIS_BOX) {
          drivers.handle(action);
          return;
        }
        set(id, { value: false });
        if (o.onOff) {
          run({ type: ACTION_SCRIPT_RUN, id: o.onOff });
        }
        const { type: payloadType } = o;
        bind.forEach((i) => {
          if (!o[i]) return;
          const { velocity, type } = get(o[i]) || {};
          const [dev, , index] = o[i].split("/");
          const { ip, type: deviceType, protocol } = get(dev);
          if (protocol === ZIGBEE) {
            zigbee.off(dev, index);
            return;
          }
          switch (deviceType) {
            case DEVICE_TYPE_DIM4:
            case DEVICE_TYPE_DIM_4:
            case DEVICE_TYPE_DIM8:
            case DEVICE_TYPE_DIM_8: {
              switch (type) {
                case DIM_TYPE_PWM:
                case DIM_TYPE_RISING_EDGE:
                case DIM_TYPE_FALLING_EDGE:
                  device.send(
                    Buffer.from([
                      ACTION_DIMMER,
                      index,
                      DIM_FADE,
                      0,
                      DIM_VELOCITY,
                    ]),
                    ip
                  );
                  break;
                default:
                  device.send(Buffer.from([ACTION_DO, index, OFF]), ip);
              }
              break;
            }
            case DEVICE_TYPE_RELAY_2:
            case DEVICE_TYPE_RELAY_2_DIN: {
              device.send(
                Buffer.from([
                  ACTION_RBUS_TRANSMIT,
                  ...dev.split(":").map((i) => parseInt(i, 16)),
                  ACTION_DO,
                  index,
                  OFF,
                ]),
                ip
              );
              break;
            }
            case DRIVER_TYPE_ARTNET: {
              switch (type) {
                case ARTNET_TYPE_DIMMER:
                  drivers.handle({
                    id: dev,
                    index,
                    action: ARTNET_FADE,
                    value: 0,
                    velocity: ARTNET_VELOCITY,
                  });
                  break;
                default:
                  drivers.handle({
                    id: dev,
                    index,
                    type: ACTION_DO,
                    value: OFF,
                    velocity: ARTNET_VELOCITY,
                  });
              }
              break;
            }
            case DRIVER_TYPE_BB_PLC1:
            case DRIVER_TYPE_BB_PLC2: {
              drivers.handle({ id: dev, index, value: OFF });
              break;
            }
            default: {
              switch (payloadType) {
                case AC: {
                  ac.handle(action);
                  break;
                }
                default: {
                  device.send(Buffer.from([ACTION_DO, index, OFF]), ip);
                }
              }
            }
          }
        });
        break;
      }
      case ACTION_DIM: {
        const { id, value } = action;
        const o = get(id) || {};
        const { last } = o;
        const R = o.r ? (get(o.r) || {}).value || 0 : 0;
        const G = o.g ? (get(o.g) || {}).value || 0 : 0;
        const B = o.b ? (get(o.b) || {}).value || 0 : 0;
        const [h, s] = color.rgb.hsv(R, G, B);
        const rgb = color.hsv.rgb(h, s, value / 2.55);
        const [r, g, b] = rgb;
        set(id, { last: o.bind ? { value } : { r, g, b }, value: !!value });
        bind.forEach((i, c) => {
          if (!o[i]) return;
          const { velocity } = get(o[i]) || {};
          const [dev, , index] = o[i].split("/");
          const { ip, type: deviceType } = get(dev);
          let v;
          if (i === "bind") {
            v = value;
          } else {
            v = rgb[c];
          }
          switch (deviceType) {
            case DEVICE_TYPE_DIM4:
            case DEVICE_TYPE_DIM_4:
            case DEVICE_TYPE_DIM8:
            case DEVICE_TYPE_DIM_8: {
              device.send(
                Buffer.from([ACTION_DIMMER, index, DIM_FADE, v, DIM_VELOCITY]),
                ip
              );
              break;
            }
            case DRIVER_TYPE_ARTNET: {
              drivers.handle({
                id: dev,
                index,
                action: ARTNET_FADE,
                v,
                velocity: ARTNET_VELOCITY,
              });
              break;
            }
          }
        });
        break;
      }
      case ACTION_DIM_RELATIVE: {
        const { id, value, operator } = action;
        const o = get(id) || {};
        let h, s, v;
        if (o.bind) {
          v = (get(o.bind) || {}).value;
        } else {
          const R = o.r ? (get(o.r) || {}).value || 0 : 0;
          const G = o.g ? (get(o.g) || {}).value || 0 : 0;
          const B = o.b ? (get(o.b) || {}).value || 0 : 0;
          [h, s, v] = color.rgb.hsv(R, G, B);
        }
        switch (operator) {
          case OPERATOR_PLUS:
            v = Math.round(v + Number(value));
            break;
          case OPERATOR_MINUS:
            v = Math.round(v - Number(value));
            break;
          case OPERATOR_MUL:
            v = Math.round(v * Number(value));
            break;
          case OPERATOR_DIV:
            v = Math.round(v / Number(value));
            break;
        }
        if (v < 0) v = 0;
        if (o.bind) {
          if (v > 255) v = 255;
        } else {
          if (v > 100) v = 100;
        }
        set(id, { value: !!v });
        const rgb = color.hsv.rgb(h, s, v);
        bind.forEach((i, c) => {
          if (!o[i]) return;
          const { velocity } = get(o[i]) || {};
          const [dev, , index] = o[i].split("/");
          const { ip, type: deviceType } = get(dev);
          if (i !== "bind") {
            v = rgb[c];
          }
          switch (deviceType) {
            case DEVICE_TYPE_DIM4:
            case DEVICE_TYPE_DIM_4:
            case DEVICE_TYPE_DIM8:
            case DEVICE_TYPE_DIM_8: {
              device.send(
                Buffer.from([ACTION_DIMMER, index, DIM_FADE, v, DIM_VELOCITY]),
                ip
              );
              break;
            }
            case DRIVER_TYPE_ARTNET: {
              drivers.handle({
                id: dev,
                index,
                action: ARTNET_FADE,
                v,
                velocity: ARTNET_VELOCITY,
              });
              break;
            }
          }
        });
        break;
      }
      case ACTION_SITE_LIGHT_DIM_RELATIVE: {
        const { id, operator, value } = action;
        applySite(id, ({ light_220 = [], light_LED = [], light_RGB = [] }) => {
          light_220.map((i) =>
            run({ type: ACTION_DIM_RELATIVE, id: i, operator, value })
          );
          light_LED.map((i) =>
            run({ type: ACTION_DIM_RELATIVE, id: i, operator, value })
          );
          light_RGB.map((i) =>
            run({ type: ACTION_DIM_RELATIVE, id: i, operator, value })
          );
        });
        break;
      }
      case ACTION_SITE_LIGHT_OFF: {
        const { id } = action;
        applySite(id, ({ light_220 = [], light_LED = [], light_RGB = [] }) => {
          light_220.map((i) => run({ type: ACTION_OFF, id: i }));
          light_LED.map((i) => run({ type: ACTION_OFF, id: i }));
          light_RGB.map((i) => run({ type: ACTION_OFF, id: i }));
        });
        break;
      }
      case ACTION_RS485_MODE: {
        const { id, index, is_rbus, baud, line_control } = action;
        const { ip } = get(id) || {};
        const buffer = Buffer.alloc(8);
        buffer[0] = ACTION_RS485_MODE;
        buffer[1] = index;
        buffer[2] = is_rbus;
        buffer.writeUInt32LE(baud, 3);
        buffer[7] = line_control;
        device.send(buffer, ip);
        break;
      }
      case ACTION_SETPOINT: {
        const { id, value } = action;
        const dev = get(id);
        if (dev.protocol === ZIGBEE) {
          zigbee.setpoint(action.id, action.index, action.value);
          return;
        }
        const { type } = get(id) || {};
        if (type === DRIVER_TYPE_INTESIS_BOX) {
          drivers.handle(action);
        } else {
          set(id, { setpoint: value });
        }
        break;
      }
      case ACTION_TIMER_START: {
        const { id, script, time } = action;
        clearTimeout(timers[id]);
        timers[id] = setTimeout(() => {
          set(id, { time: 0, state: false });
          run({ type: ACTION_SCRIPT_RUN, id: script });
        }, parseInt(time));
        set(id, { time, script, state: true, timestamp: Date.now() });
        break;
      }
      case ACTION_TIMER_STOP: {
        const { id } = action;
        clearTimeout(timers[id]);
        set(id, { time: 0, state: false });
        break;
      }
      case ACTION_SCHEDULE_START: {
        const { id, script, schedule } = action;
        if (schedules[id]) {
          schedules[id].stop();
          delete schedules[id];
        }
        if (schedule && script) {
          schedules[id] = new CronJob(
            schedule,
            () => {
              run({ type: ACTION_SCRIPT_RUN, id: script });
            },
            () => {
              set(id, { state: false });
            },
            true
          );
          set(id, { state: true, script, schedule });
        } else {
          set(id, { state: false });
        }
        break;
      }
      case ACTION_SCHEDULE_STOP: {
        const { id } = action;
        if (schedules[id]) {
          schedules[id].stop();
          delete schedules[id];
        }
        set(id, { state: false });
        break;
      }
      case ACTION_CLOCK_START: {
        const { id } = action;
        const { state } = get(id);
        if (!state) {
          set(id, { timestamp: Date.now(), state: true });
        }
        break;
      }
      case ACTION_CLOCK_STOP: {
        const { id } = action;
        const { state } = get(id);
        if (state) {
          set(id, { timestamp: Date.now(), state: false });
        }
        break;
      }
      case ACTION_CLOCK_TEST: {
        const { id, time, onTrue, onFalse, operator } = action;
        const { timestamp, state } = get(id);
        const t = Date.now() - timestamp;
        let script;
        if (state) {
          switch (operator) {
            case OPERATOR_LT: {
              script = t < time ? onTrue : onFalse;
              break;
            }
            case OPERATOR_LE: {
              script = t <= time ? onTrue : onFalse;
              break;
            }
            case OPERATOR_EQ: {
              script = t === time ? onTrue : onFalse;
              break;
            }
            case OPERATOR_NE: {
              script = t !== time ? onTrue : onFalse;
              break;
            }
            case OPERATOR_GE: {
              script = t >= time ? onTrue : onFalse;
              break;
            }
            case OPERATOR_GT: {
              script = t > time ? onTrue : onFalse;
              break;
            }
          }
          if (script) {
            run({ type: ACTION_SCRIPT_RUN, id: script });
          }
        }
        break;
      }
      case ACTION_DAY_TEST: {
        const { project } = get(mac());
        if (project) {
          const { weather } = get(project);
          if (weather && weather.sys) {
            const { sunrise, sunset } = weather.sys;
            const { onFalse, onTrue } = action;
            const now = Date.now();
            const script = now > sunrise && now < sunset ? onTrue : onFalse;
            if (script) {
              run({ type: ACTION_SCRIPT_RUN, id: script });
            }
          }
        }
        break;
      }
      case ACTION_NIGHT_TEST: {
        const { project } = get(mac());
        if (project) {
          const { weather } = get(project);
          if (weather && weather.sys) {
            const { sunrise, sunset } = weather.sys;
            const { onFalse, onTrue } = action;
            const now = Date.now();
            const script = now < sunrise || now > sunset ? onTrue : onFalse;
            if (script) {
              run({ type: ACTION_SCRIPT_RUN, id: script });
            }
          }
        }
        break;
      }
      case ACTION_DOPPLER_HANDLE: {
        const { id, low, high, onQuiet, onLowThreshold, onHighThreshold } =
          action;
        const { active } = get(action.action);
        const { value } = get(id);
        if (value >= high) {
          set(action.action, { active: true });
          if (onHighThreshold) {
            run({ type: ACTION_SCRIPT_RUN, id: onHighThreshold });
          }
          if (onLowThreshold) {
            run({ type: ACTION_SCRIPT_RUN, id: onLowThreshold });
          }
        } else if (value >= low) {
          set(action.action, { active: true });
          if (onLowThreshold) {
            run({ type: ACTION_SCRIPT_RUN, id: onLowThreshold });
          }
        } else if (active) {
          set(action.action, { active: false });
          if (onQuiet) {
            run({ type: ACTION_SCRIPT_RUN, id: onQuiet });
          }
        }
        break;
      }
      case ACTION_THERMOSTAT_HANDLE: {
        const {
          id,
          cool_hysteresis,
          cool_threshold,
          heat_hysteresis,
          heat_threshold,
          onStartHeat,
          onStartCool,
          onStopHeat,
          onStopCool,
        } = action;
        const { setpoint, sensor, state, mode, site } = get(id);
        const { temperature } = get(sensor);
        const make = (state, script, mode) => () => {
          set(id, { state, mode });
          if (script) {
            run({ type: ACTION_SCRIPT_RUN, id: script });
          }
        };
        const stopCool = make(STOP, onStopCool, mode);
        const stopHeat = make(STOP, onStopHeat, mode);
        const startCool = make(COOL, onStartCool, COOL);
        const startHeat = make(HEAT, onStartHeat, HEAT);
        set(site, { temperature });
        if (temperature > setpoint - -heat_threshold) {
          stopHeat();
          startCool();
        } else if (temperature < setpoint - cool_threshold) {
          stopCool();
          startHeat();
        } else {
          switch (mode) {
            case HEAT: {
              // stopCool();
              if (temperature < setpoint - heat_hysteresis) {
                stopCool();
                startHeat();
              } else if (temperature > setpoint - -heat_hysteresis) {
                stopHeat();
              }
              break;
            }
            case COOL: {
              // stopHeat();
              startCool();
              // stopHeat();
              // if (temperature > setpoint - (- cool_hysteresis)) {
              //   stopHeat();
              //   startCool();
              // } else if (temperature < setpoint - cool_hysteresis) {
              //   stopCool();
              // }
              break;
            }
            default: {
              if (temperature > setpoint) {
                stopHeat();
                startCool();
              } else if (temperature < setpoint) {
                stopCool();
                startHeat();
              } else {
                stopCool();
                stopHeat();
              }
            }
          }
        }
        break;
      }
      case ACTION_LIMIT_HEATING_HANDLE: {
        const { id, hysteresis, onStartHeat, onStopHeat } = action;
        const { min, max, sensor } = get(id);
        const { temperature } = get(sensor);
        const make = (script) => () => {
          if (script) {
            run({ type: ACTION_SCRIPT_RUN, id: script });
          }
        };
        const stopHeat = make(onStopHeat);
        const startHeat = make(onStartHeat);
        if (temperature > max - -hysteresis) {
          set(id, { disabled: false });
          stopHeat();
          set(id, { disabled: true });
        } else if (temperature < min - hysteresis) {
          set(id, { disabled: false });
          startHeat();
          set(id, { disabled: true });
        } else if (
          temperature > min - -hysteresis &&
          temperature < max - hysteresis
        ) {
          set(id, { disabled: false });
        }
        break;
      }
      case ACTION_TOGGLE: {
        const { test = [], onOn, onOff } = action;
        const f = test.find((i) => {
          const o = get(i);
          if (o.value === undefined || o.value === null) {
            return bind.find((j) => (get(o[j]) || {}).value);
          }
          return o.value;
        });
        if (f) {
          if (onOff) {
            run({ type: ACTION_SCRIPT_RUN, id: onOff });
          }
        } else {
          if (onOn) {
            run({ type: ACTION_SCRIPT_RUN, id: onOn });
          }
        }
        break;
      }
      case ACTION_TV: {
        const { id, command, repeat } = action;
        const { bind, brand, model } = get(id) || {};
        const [dev, , index] = bind.split("/");
        const { ip, type, version = "" } = get(dev);
        const codes = ircodes.codes.TV[brand][model];
        const code = codes.command[command];
        const legacy = () => {
          const data = ircodes.encode(
            codes.count,
            codes.header,
            codes.trail,
            code
          );
          const buff = Buffer.alloc(data.length * 2 + 5);
          buff.writeUInt8(ACTION_IR, 0);
          buff.writeUInt8(index, 1);
          buff.writeUInt8(0, 2);
          buff.writeUInt16BE(codes.frequency, 3);
          for (let i = 0; i < data.length; i++) {
            buff.writeUInt16BE(data[i], i * 2 + 5);
          }
          return buff;
        };
        switch (type) {
          case DEVICE_TYPE_IR_4: {
            const [major] = version.split(".");
            const header = Buffer.alloc(7);
            header.writeUInt8(ACTION_RBUS_TRANSMIT, 0);
            dev.split(":").forEach((v, i) => {
              header.writeUInt8(parseInt(v, 16), i + 1);
            });
            device.send(
              Buffer.concat([
                header,
                major < 2 ? legacy() : Buffer.from([ACTION_IR, index, ...code]),
              ]),
              ip
            );
            break;
          }
          default:
            device.send(legacy(), ip);
        }
        break;
      }
      case ACTION_LEAKAGE_RESET: {
        const { onLeakageReset } = get(action.id);
        set(action.id, { value: 0 });
        if (onLeakageReset) {
          run({ action: ACTION_SCRIPT_RUN, id: onLeakageReset });
        }
        break;
      }
      case NOTIFY: {
        notification.broadcastNotification(action);
        break;
      }
      case RING: {
        notification.broadcastAction(action);
        break;
      }
      case CLOSURE: {
        const { id, index, value } = action;
        const { protocol } = get(id) || {};
        if (protocol === ZIGBEE) {
          zigbee.closure(id, index, value);
        }
        break;
      }
      case ACTION_SET_ADDRESS:
      case ACTION_SET_MODE:
      case ACTION_SET_DIRECTION:
      case ACTION_SET_FAN_SPEED: {
        drivers.handle(action);
        break;
      }
      case ACTION_LANAMP: {
        const { id, index, mode = 0, volume = [], source = [[], []] } = action;
        const { ip } = get(id);
        const buffer = Buffer.alloc(25);
        buffer.writeUInt8(ACTION_LANAMP, 0);
        buffer.writeUInt8(index, 1);
        buffer.writeUInt8(mode, 2);
        for (let i = 0; i < 2; i++) {
          buffer.writeUInt8(volume[i] || 0, i + 3);
          for (let j = 0; j < 5; j++) {
            buffer.writeUInt8(source[i][j].active || 0, i * 5 + j + 4);
            buffer.writeUInt8(source[i][j].volume || 0, i * 5 + j + 14);
          }
        }
        device.send(buffer, ip);
        break;
      }
      case ACTION_SCRIPT_RUN: {
        const { id } = action;
        const script = get(id);
        if (script && Array.isArray(script.action)) {
          script.action.forEach((i) => {
            const { type, payload, delay } = get(i);
            const a = { action: i, type, ...payload };
            if (delay > 0) {
              setTimeout(run, delay, a);
            } else {
              run(a);
            }
          });
        }
        break;
      }
    }
  } catch (e) {
    console.error(e);
  }
};

module.exports.run = run;
