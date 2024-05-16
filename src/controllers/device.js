const crypto = require("crypto");
const {
  DO,
  DI,
  DIM,
  GROUP,
  RS485,
  POOL,
  DEVICE,
  DEVICE_TYPE_PLC,
  ACTION_DI,
  ACTION_DO,
  ACTION_GROUP,
  ACTION_IR,
  ACTION_RS485_MODE,
  ACTION_RS485_TRANSMIT,
  ACTION_TEMPERATURE,
  ACTION_TEMPERATURE_CORRECT,
  ACTION_HUMIDITY,
  ACTION_ILLUMINATION,
  ACTION_DIMMER,
  ACTION_DOPPLER0,
  ACTION_DOPPLER_RAW,
  ACTION_SCRIPT_RUN,
  ACTION_IP_ADDRESS,
  ACTION_MAC_ADDRESS,
  ACTION_DISCOVERY,
  ACTION_READY,
  ACTION_INITIALIZE,
  ACTION_INITIALIZED,
  ACTION_ERROR,
  ACTION_FIND_ME,
  ACTION_BOOTLOAD,
  DIM_TYPE_FALLING_EDGE,
  DIM_TYPE_RISING_EDGE,
  DIM_TYPE_PWM,
  DEVICE_GROUP,
  DEVICE_TYPE_UNKNOWN,
  DEVICE_TYPE_TEMPERATURE_EXT,
  IP_ADDRESS_POOL_START,
  IP_ADDRESS_POOL_END,
  SUB_NET_MASK,
  ACTION_PNP,
  PNP_ENABLE,
  PNP_STEP,
  onOff,
  onOn,
  onHold,
  onClick,
  onDoppler,
  onHumidity,
  onIllumination,
  onTemperature,
  CLOSE_OPEN,
  ACTION_DI_RELAY_SYNC,
  ACTION_IR_CONFIG,
  ACTION_LANAMP,
  AO,
  DEVICE_TYPE_AO_4_DIN,
  ACTION_RTP,
  ACTION_RGB,
  ACTION_IMAGE,
  ACTION_VIBRO,
  DEVICE_TYPE_DIM4,
  DEVICE_TYPE_DIM8,
  DEVICE_TYPE_RS_HUB1_RS,
  ACTION_CO2,
  ACTION_ATS_MODE,
  ACTION_TEMPERATURE_EXT_DEPRECATED,
  ACTION_TEMPERATURE_EXT_OLD,
  ACTION_TEMPERATURE_EXT,
  ACTION_RBUS_TRANSMIT,
  TEMPERATURE_EXT,
  ACTION_SMART_TOP,
  ACTION_SMART_TOP_DETECT,
  DOPPLER,
  ACTION_DOPPLER1,
  DEVICE_TYPE_SMART_TOP_A6P,
  DEVICE_TYPE_SMART_TOP_G4D,
  DEVICE_TYPE_DIM_4,
  ACTION_BLINK,
  ACTION_THERMOSTAT_HANDLE,
  ACTION_HYGROSTAT_HANDLE,
  ACTION_CO2_STAT_HANDLE,
} = require("../constants");
const {
  get,
  set,
  add,
  count_on,
  count_off,
  offline,
  online,
  updateFirmware,
  initialize,
  initialized,
} = require("../actions");
const { device } = require("../sockets");
const { run } = require("./service");
const drivers = require("../drivers");
const mac = require("../mac");
const { int2ip } = require("../util");
const { image2char } = require("../drivers/display");
const { on } = require("events");

const onDI = [onOff, onOn, onHold, onClick];
const onDO = [onOff, onOn];
const count = [count_off, count_on];

let last_ip = IP_ADDRESS_POOL_START;

const hold = {};

module.exports.manage = () => {
  ((get(mac()) || {}).device || []).forEach((id) => {
    offline(id);
  });

  const handleData = (data, { address }, { hub = null } = {}) => {
    try {
      const dev_mac = Array.from(data.slice(0, 6));
      const id = dev_mac.map((i) => `0${i.toString(16)}`.slice(-2)).join(":");
      const dev = get(id) || {};
      if (dev) {
        online(id, { ip: address, hub, type: dev.type });
      }
      const action = data[6];
      switch (action) {
        case DEVICE_TYPE_PLC: {
          for (let i = 1; i <= 36; i++) {
            const channel = `${id}/${DI}/${i}`;
            const chan = get(channel);
            const value = data[i + 6];
            if (chan && chan.value !== value) {
              set(channel, { value });
              const script = chan[onDI[value]];
              if (script) {
                run({ type: ACTION_SCRIPT_RUN, id: script });
              }
            }
          }
          for (let i = 1; i <= 24; i++) {
            const channel = `${id}/${DO}/${i}`;
            const chan = get(channel);
            const value = data[i + 42];
            set(channel, { value });
            if (chan) {
              const { bind } = chan;
              if (bind) {
                if (chan.value !== value) {
                  const script = chan[onDO[value]];
                  if (script) {
                    run({ type: ACTION_SCRIPT_RUN, id: script });
                  }
                  count[value](bind);
                }
              }
            }
          }
          break;
        }
        case ACTION_DI: {
          const index = data[7];
          const value = data[8] ? 1 : 0;
          const channel = `${id}/${DI}/${index}`;
          const chan = get(channel);
          if (chan && chan.value !== value) {
            set(channel, { value });
            const { timeout, timestamp = Date.now(), count = 0 } = hold[channel] || {};
            if (value) {
              if (!count) {
                clearTimeout(timeout);
                hold[channel] = {
                  count: 0,
                  timestamp: Date.now(),
                }
              }
              const { onOnCount = 0 } = chan;
              set(channel, { onOnCount: onOnCount + 1 });
              handleOn(id, chan);
              // const onClick1 = toArr(chan.onClick1 || chan.onClick);
              // const onClick2 = toArr(chan.onClick2);
              // const onClick3 = toArr(chan.onClick3);
              // if (onClick1.length > 0 || onClick2.length > 0 || onClick3.length > 0) {
              hold[channel].count++;
              // if (onClick2.length > 0 || onClick3.length > 0) {
              setTimeout(() => {
                switch (hold[channel].count) {
                  case 1: {
                    if (!chan.value) {
                      const { onClick1Count = 0 } = chan;
                      set(channel, { onClick1Count: onClick1Count + 1 });
                      handleClick1(id, chan);
                    }
                    break;
                  }
                  case 2: {
                    const { onClick2Count = 0 } = chan;
                    set(channel, { onClick2Count: onClick2Count + 1 });
                    handleClick2(id, chan);
                    break;
                  }
                  case 3: {
                    const { onClick3Count = 0 } = chan;
                    set(channel, { onClick3Count: onClick3Count + 1 });
                    handleClick3(id, chan);
                    break;
                  }
                }
                hold[channel] = { count: 0 };
              }, parseInt(chan.timeout || 1000) / 2);
              // }
              // }
              // const onHold = toArr(chan.onHold);
              // if (onHold.length > 0) {
              const handleHold_ = (start = false) => {
                if (!chan.value) return;
                if (start) {
                  const { onHoldCount = 0 } = chan;
                  set(channel, { onHoldCount: onHoldCount + 1 });
                }
                if (handleHold(id, chan)) {
                  hold[channel] = {
                    count: 0,
                    timeout: setTimeout(
                      handleHold_,
                      parseInt(chan.interval || 100)
                    )
                  };
                }
              };
              hold[channel].timeout = setTimeout(handleHold_, parseInt(chan.timeout || 1000), true);
              // }
            } else {
              clearTimeout(timeout);
              // if (count === 1) {
              //   // const onClick1 = toArr(chan.onClick1 || chan.onClick);
              //   // if (onClick1.length > 0) {
              //   //   // const onClick2 = toArr(chan.onClick2);
              //   //   // const onClick3 = toArr(chan.onClick3);
              //   //   // const dt = Date.now() - timestamp;
              //   //   // if (onClick2.length === 0 && onClick3.length === 0) {
              //   //   //   if (dt < parseInt(chan.timeout || 1000) / 2) {
              //   //   //     const { onClick1Count = 0 } = chan;
              //   //   //     set(channel, { onClick1Count: onClick1Count + 1 });
              //   //   //     run({ type: ACTION_SCRIPT_RUN, id: onClick1[onClick1Count % onClick1.length] });
              //   //   //   }
              //   //   //   hold[channel] = { count: 0 };
              //   //   // }
              //   // }
              // }
              const { onOffCount = 0 } = chan;
              set(channel, { onOffCount: onOffCount + 1 });
              handleOff(id, chan);
            }
          } else {
            set(channel, { value });
          }

          break;
        }
        case ACTION_DO: {
          const { type } = get(id) || {};
          if (type === DEVICE_TYPE_SMART_TOP_A6P || type === DEVICE_TYPE_SMART_TOP_G4D) {
            set(id, { state: data[7] })
            return;
          }
          const index = data[7];
          const value = data[8];
          const cid = `${id}/${DO}/${index}`;
          const channel = get(cid);
          const gid = `${id}/${GROUP}/${((index - 1) >> 1) + 1}`;
          const group = get(gid);
          set(cid, { value });
          if (data.length === 13) {
            const timeout = data.readUInt32LE(9);
            set(cid, { timeout });
          } else if (data.length === 14) {
            const group = data.readUInt8(9);
            const timeout = data.readUInt32LE(10);
            set(cid, { group, timeout });
          }
          if (group && group.enabled) {
            if (value) {
              if (group === CLOSE_OPEN) {
                set(gid, { value: index % 2 === 1 });
              } else {
                set(gid, { value: index % 2 === 0 });
              }
            }
          } else if (channel) {
            const { bind } = channel;
            if (bind) {
              if (channel.value !== value) {
                const script = channel[onDO[value]];
                if (script) {
                  run({ type: ACTION_SCRIPT_RUN, id: script });
                }
                count[value](bind);
              }
            }
          }
          break;
        }
        case ACTION_GROUP: {
          const index = data[7];
          const enabled = data[8];
          const delay = data.readUInt32LE(9);
          const channel = `${id}/${GROUP}/${index}`;
          set(channel, { enabled, delay });
          break;
        }
        case ACTION_DI_RELAY_SYNC: {
          const index = data[7];
          const value = data.slice(8);
          const onOff = value.slice(0, value.length / 2);
          const onOn = value.slice(value.length / 2);
          const channel = `${id}/${DI}/${index}`;
          set(channel, { sync: [[...onOff], [...onOn]] });
          break;
        }
        case ACTION_ATS_MODE: {
          set(id, {
            mode: data[7],
            source: data[8],
            attempt: data[9],
            error: [data[10], data[11], data[12], data[13]]
          });
          break;
        }
        case ACTION_RS485_MODE: {
          const index = data[7];
          const is_rbus = data[8];
          const baud = data.readUInt32LE(9);
          const line_control = data[13];
          const channel = `${id}/${RS485}/${index}`;
          set(channel, { is_rbus, baud, line_control });
          break;
        }
        case ACTION_RS485_TRANSMIT: {
          const index = data[7];
          const channel = `${id}/${RS485}/${index}`;
          const { bind } = get(channel) || {};
          // console.log(
          //   "RS485",
          //   Array.from(data)
          //     .map((i) => i.toString(16).padStart(2, "0"))
          //     .join(" ")
          // );
          drivers.handle({ id: bind, data: data.slice(8) });
          break;
        }
        case ACTION_RBUS_TRANSMIT: {
          const buff = data.slice(7);
          const mac = buff.slice(0, 6);
          const did = Array.from(mac).map((i) => i.toString(16).padStart(2, '0')).join(':');
          const device = get(id) || {};
          set(did, {
            port: buff[6],
            address: buff[7],
            hub: id,
          });
          handleData(Buffer.concat([mac, buff.slice(8)]), { address }, { hub: id });
          break;

        }
        case ACTION_SMART_TOP: {
          // console.log('from top:', data);
          const action = data[7];
          switch (action) {
            case ACTION_DISCOVERY: {
              const top_mac = Array.from(data.slice(8, 14));
              const top_id = top_mac.map((i) => `0${i.toString(16)}`.slice(-2)).join(":");
              set(id, { top: top_id, topDetected: true });
              online(top_id, { type: data[14], bottom: id, version: `${data[15]}.${data[16]}`, ip: address, ready: true });
              break;
            }
            default: {
              const { top, hub } = get(id) || {};
              if (top) {
                const mac_ = Buffer.from(top.split(':').map(i => parseInt(i, 16)));
                handleData(Buffer.concat([mac_, data.slice(7)]), { address }, { hub });
              }
            }
          }
          break;
        }
        case ACTION_SMART_TOP_DETECT: {
          set(id, { topDetected: data[7] });
          break;
        }
        case ACTION_DIMMER: {
          const device = get(id) || {};
          switch (device.type) {
            case DEVICE_TYPE_AO_4_DIN: {
              const [, , , , , , , index, value, velocity] = data;
              const channel = `${id}/${AO}/${index}`;
              const chan = get(channel);
              set(channel, {
                value,
                velocity,
                dimmable: true,
              });
              if (chan) {
                const { bind } = chan;
                if (bind) {
                  const v = value ? 1 : 0;
                  const v_ = chan.value ? 1 : 0;
                  if (v !== v_) {
                    const script = chan[onDO[v]];
                    if (script) {
                      run({ type: ACTION_SCRIPT_RUN, id: script });
                    }
                    count[v](bind);
                  }
                }
              }
              break;
            }
            case DEVICE_TYPE_DIM4:
            case DEVICE_TYPE_DIM8: {
              const [, , , , , , , index, type, value, velocity] = data;
              const channel = `${id}/${DIM}/${index}`;
              const chan = get(channel);
              set(channel, {
                type,
                value,
                velocity,
                dimmable:
                  type === DIM_TYPE_FALLING_EDGE ||
                  type === DIM_TYPE_RISING_EDGE ||
                  type === DIM_TYPE_PWM,
              });
              if (chan) {
                const { bind } = chan;
                if (bind) {
                  const v = value ? 1 : 0;
                  const v_ = chan.value ? 1 : 0;
                  if (v !== v_) {
                    const script = chan[onDO[v]];
                    if (script) {
                      run({ type: ACTION_SCRIPT_RUN, id: script });
                    }
                    count[v](bind);
                  }
                }
              }
              break;
            }
            case DEVICE_TYPE_SMART_TOP_A6P:
            case DEVICE_TYPE_SMART_TOP_G4D: {
              set(id, { brightness: data[7] });
              break;
            }
            default: {
              const { version = "" } = get(id) || {};
              const major = parseInt(version.split(".")[0], 10);
              let index, group, type, value, velocity;
              if (major < 2) {
                [, , , , , , , index, type, value, velocity] = data;
                group = index;
              } else {
                [, , , , , , , index, group, type, value, velocity] = data;
              }
              const channel = `${id}/${DIM}/${index}`;
              const chan = get(channel);
              set(channel, {
                type,
                group,
                value,
                velocity,
                dimmable:
                  type === DIM_TYPE_FALLING_EDGE ||
                  type === DIM_TYPE_RISING_EDGE ||
                  type === DIM_TYPE_PWM,
              });
              if (chan) {
                const { bind } = chan;
                if (bind) {
                  const v = value ? 1 : 0;
                  const v_ = chan.value ? 1 : 0;
                  if (v !== v_) {
                    const script = chan[onDO[v]];
                    if (script) {
                      run({ type: ACTION_SCRIPT_RUN, id: script });
                    }
                    count[v](bind);
                  }
                }
              }
            }
          }
          break;
        }
        case ACTION_RGB: {
          const [, , , , , , , index] = data;
          for (let i = 0; i < (data.length - 8) / 3; i++) {
            const chan = `${id}/rgb/${index + i}`;
            set(chan, {
              r: data[i * 3 + 8],
              g: data[i * 3 + 9],
              b: data[i * 3 + 10],
            });
          }
          break;
        }
        case ACTION_IMAGE: {
          const { type } = get(id) || {};
          switch (type) {
            case DEVICE_TYPE_SMART_TOP_A6P:
            case DEVICE_TYPE_SMART_TOP_G4D: {
              const image = Array.from(data.slice(7, 15))
              set(id, { image });
              break;
            }
            default:
              const [, , , , , , , level, i2, i1] = data;
              const c2 = image2char[i2] || " ";
              const c1 = image2char[i1] || " ";
              set(id, { level, image: [i2, i1], text: c2 + c1 });
          }
          break;
        }
        case ACTION_BLINK: {
          const { type } = get(id) || {};
          switch (type) {
            case DEVICE_TYPE_SMART_TOP_A6P:
            case DEVICE_TYPE_SMART_TOP_G4D: {
              const blink = Array.from(data.slice(7, 15))
              set(id, { blink });
              break;
            }
          }
          break;
        } case ACTION_TEMPERATURE_CORRECT: {
          const correct = data.readInt8(7) / 10;
          set(id, { correct });
          break;
        }
        case ACTION_VIBRO: {
          const vibro = data.readUInt8(7);
          set(id, { vibro });
          break;
        }
        case ACTION_TEMPERATURE: {
          const temperature_raw = data.readUInt16LE(7) / 100;
          const { onTemperature, site, display, temperature_correct = 0 } = get(id) || {};
          const temperature = temperature_raw + temperature_correct;
          if (site) calcTemperature(site);
          set(id, { temperature, temperature_raw });
          if (onTemperature) {
            run({ type: ACTION_SCRIPT_RUN, id: onTemperature });
          }
          if (display) {
            const { lock } = get(display) || {};
            if (!lock) {
              run({
                type: ACTION_IMAGE,
                id: display,
                value: Math.round(temperature),
              });
            }
          }
          break;
        }
        case ACTION_TEMPERATURE_EXT_DEPRECATED:
        case ACTION_TEMPERATURE_EXT_OLD:
        case ACTION_TEMPERATURE_EXT: {
          if (data.length < 15) {
            return;
          }
          const dev_id =
            action === ACTION_TEMPERATURE_EXT || action === ACTION_TEMPERATURE_EXT_OLD
              ? Array.from(data)
                .slice(7, 15)
                .map((i) => i.toString(16).padStart(2, "0"))
                .join(":")
              : data
                .slice(7, 15)
                .map((i) => `0${i.toString(16)}`.slice(-2))
                .join(":");
          if (data.length < 17) {
            return;
          }
          const temperature_raw = data.readInt16LE(15) / 100;
          const { temperature_correct = 0 } = get(dev_id) || {};
          const temperature = temperature_raw + temperature_correct;
          online(dev_id, { temperature, temperature_raw, master: id, type: DEVICE_TYPE_TEMPERATURE_EXT, version: '1.0', ready: true });
          add(id, TEMPERATURE_EXT, dev_id);
          const { onTemperature: onTemperature, display, site } = get(dev_id);
          if (site) calcTemperature(site);
          if (onTemperature) {
            run({ type: ACTION_SCRIPT_RUN, id: onTemperature });
          }
          if (display) {
            const { lock } = get(display) || {};
            if (!lock) {
              run({
                type: ACTION_IMAGE,
                id: display,
                value: Math.round(temperature),
              });
            }
          }
          break;
        }
        case ACTION_HUMIDITY: {
          const humidity_raw = data.readUInt16LE(7) / 100;
          const { onHumidity, site, humidity_correct = 0 } = get(id) || {};
          const humidity = humidity_raw + humidity_correct;
          if (site) calcHumidity(site);
          set(id, { humidity });
          if (onHumidity) {
            run({ type: ACTION_SCRIPT_RUN, id: onHumidity });
          }
          break;
        }
        case ACTION_ILLUMINATION: {
          const illumination_raw = data.readUInt32LE(7) / 100;
          const { onIllumination, illumination_correct = 0, site } = get(id) || {};
          const illumination = illumination_raw + illumination_correct;
          if (site) calcIllumination(site);
          set(id, { illumination });
          if (onIllumination) {
            run({ type: ACTION_SCRIPT_RUN, id: onIllumination });
          }
          break;
        }
        case ACTION_CO2: {
          const co2_raw = data.readUInt16LE(7);
          const { onCO2, co2_correct = 0, site } = get(id) || {};
          const co2 = co2_raw + co2_correct;
          if (site) calcCO2(site);
          set(id, { co2 });
          if (onCO2) {
            run({ type: ACTION_SCRIPT_RUN, id: onCO2 });
          }
          break;
        }
        case ACTION_DOPPLER0: {
          const [, , , , , , , value, gain] = data;
          const { onDoppler } = get(id) || {};
          set(id, { value, gain });
          if (onDoppler) {
            run({ type: ACTION_SCRIPT_RUN, id: onDoppler });
          }
          break;
        }
        case ACTION_DOPPLER1: {
          const value = [...data.slice(7)];
          const { onDoppler } = get(id) || {};
          set(id, { value });
          if (onDoppler) {
            run({ type: ACTION_SCRIPT_RUN, id: onDoppler });
          }
          break;
        }
        case ACTION_DOPPLER_RAW: {
          set(id, { raw: [...data.slice(7)] });
          break;
        }
        case ACTION_IR: {
          const now = Date.now();
          const dev = get(id) || {};
          let value;
          if (now - dev.timestamp > 1000) {
            value = [];
          } else {
            value = [...dev.value];
          }
          const buff = data.slice(7);
          for (let i = 0; i < buff.length; i += 2) {
            const x = buff.readUInt16LE(i);
            value.push(x);
          }
          set(id, { value });
          break;
        }
        case ACTION_IR_CONFIG: {
          // console.log(data.slice(7));
          break;
        }
        case ACTION_LANAMP: {
          const index = data[7];
          const mode = data[8];
          const volume = [];
          const source = [];
          for (let i = 0; i < 2; i++) {
            volume[i] = data[i + 9];
            source[i] = [];
            for (let j = 0; j < 9; j++) {
              source[i][j] = {
                active: Boolean(data[i * 9 + j + 11]),
                volume: data[i * 9 + j + 11 + 9 * 2],
              };
            }
          }
          set(`${id}/lanamp/${index}`, { mode, volume });
          switch (mode) {
            case 0b01:
            case 0b10: {
              set(`${id}/stereo/${index}`, { source: source[0] });
              break;
            }
            case 0b11: {
              set(`${id}/mono/${2 * index - 1}`, { source: source[0] });
              set(`${id}/mono/${2 * index}`, { source: source[1] });
              break;
            }
          }
          break;
        }
        case ACTION_RTP: {
          const index = data[7];
          const active = data[8];
          const group = int2ip(data.readUInt32BE(9));
          const port = data.readUInt16LE(13);
          const chan = `${id}/rtp/${index}`;
          set(chan, { active, group, port });
          break;
        }
        case ACTION_INITIALIZE: {
          initialize(id);
          break;
        }
        case ACTION_INITIALIZED: {
          initialized(id);
          break;
        }
        case ACTION_IP_ADDRESS: {
          const lookup = (get(POOL) || {})[id];
          if (lookup) {
            const buff = Buffer.alloc(15);
            buff.writeUInt8(ACTION_IP_ADDRESS, 0);
            Buffer.from(dev_mac).copy(buff, 1, 0, 6);
            buff.writeUInt32BE(lookup, 7);
            buff.writeUInt32BE(SUB_NET_MASK, 11);
            device.send(buff, DEVICE_GROUP);
          } else if (last_ip < IP_ADDRESS_POOL_END) {
            const buff = Buffer.alloc(15);
            buff.writeUInt8(ACTION_IP_ADDRESS, 0);
            Buffer.from(dev_mac).copy(buff, 1, 0, 6);
            const pool = Object.values(get(POOL) || {});
            while (last_ip < IP_ADDRESS_POOL_END) {
              if (!pool.includes(last_ip)) break;
              last_ip++;
            }
            set(POOL, { [id]: last_ip });
            buff.writeUInt32BE(last_ip, 7);
            buff.writeUInt32BE(SUB_NET_MASK, 11);
            device.send(buff, DEVICE_GROUP);
          }
          break;
        }
        case ACTION_MAC_ADDRESS: {
          crypto.randomBytes(7, (err, a) => {
            if (err) console.error(err);
            else {
              a[0] = ACTION_MAC_ADDRESS;
              a[1] &= 0b11111110;
              a[1] |= 0b00000010;
              device.send(a, address);
            }
          });
          break;
        }
        case ACTION_READY:
        case ACTION_DISCOVERY: {
          const type = data[7];
          const version = `${data[8]}.${data[9]}`;
          online(id, { type, version, ip: address, ready: true });
          add(mac(), DEVICE, id)
          break;
        }
        case ACTION_FIND_ME: {
          set(id, { finding: !!data[7] });
          break;
        }
        case ACTION_BOOTLOAD: {
          updateFirmware(id);
          break;
        }
        case ACTION_ERROR: {
          const reason = data[7];
          switch (reason) {
            case ACTION_BOOTLOAD:
              set(id, { pending: false, updating: false });
              console.error(data);
              break;
            default: {
              console.error(data);
            }
          }
        }
        // default: {
        // }
      }
    } catch (e) {
      console.error(e);
    }
  };
  device.handle(handleData);
};


const calcTemperature = site => {
  const { sensor = [], thermostat = [] } = get(site) || {};
  let temperature = 0;
  let n = 0;
  sensor.forEach(id => {
    const dev = get(id) || {};
    if (dev.online) {
      temperature += dev.temperature;
      n++;
    }
  });
  if (n > 0) {
    temperature /= n;
    set(site, { temperature });
    thermostat.forEach(id => {
      run({
        type: ACTION_THERMOSTAT_HANDLE,
        id, ...get(id)
      });
    })
  }
}

const calcHumidity = site => {
  const { sensor = [], hygrostat = [] } = get(site) || {};
  let humidity = 0;
  let n = 0;
  sensor.forEach(id => {
    const dev = get(id) || {};
    if (dev.online) {
      humidity += dev.humidity;
      n++;
    }
  });
  if (n > 0) {
    humidity /= n;
    set(site, { humidity });
    hygrostat.forEach(id => {
      run({
        type: ACTION_HYGROSTAT_HANDLE,
        id, ...get(id)
      });
    })
  }
}

const calcIllumination = site => {
  const { sensor = [] } = get(site) || {};
  let illumination = 0;
  let n = 0;
  sensor.forEach(id => {
    const dev = get(id) || {};
    if (dev.online) {
      illumination += dev.illumination;
      n++;
    }
  });
  if (n > 0) {
    illumination /= n;
    set(site, { illumination });
  }
}

const calcCO2 = site => {
  const { sensor = [], co2_stat = [] } = get(site) || {};
  let co2 = 0;
  let n = 0;
  sensor.forEach(id => {
    const dev = get(id) || {};
    if (dev.online) {
      co2 += dev.co2;
      n++;
    }
  });
  if (n > 0) {
    co2 /= n;
    set(site, { co2 });
    co2_stat.forEach(id => {
      run({
        type: ACTION_CO2_STAT_HANDLE,
        id, ...get(id)
      });
    })
  }
}

const toArr = a => Array.isArray(a) ? a : a ? [a] : [];

const handleOn = (id, chan) => {
  console.log("On", chan);
  const onOn = toArr(chan.onOn);
  if (onOn.length > 0) {
    const { onOnCount = 0 } = chan;
    run({ type: ACTION_SCRIPT_RUN, id: onOn[onOnCount % onOn.length] });
  }
}

const handleOff = (id, chan) => {
  console.log("Off", chan);
  const onOff = toArr(chan.onOff);
  if (onOff.length > 0) {
    const { onOffCount = 0 } = chan;
    run({ type: ACTION_SCRIPT_RUN, id: onOff[onOffCount % onOff.length] });
  }
}

const handleClick1 = (id, chan) => {
  console.log("Click1", chan);
  const onClick1 = toArr(chan.onClick1 || chan.onClick);
  if (onClick1.length > 0) {
    const { onClick1Count = 0 } = chan;
    run({ type: ACTION_SCRIPT_RUN, id: onClick1[onClick1Count % onClick1.length] });
  }
}

const handleClick2 = (id, chan) => {
  console.log("Click2", chan);
  const onClick2 = toArr(chan.onClick2);
  if (onClick2.length > 0) {
    const { onClick2Count = 0 } = chan;
    run({ type: ACTION_SCRIPT_RUN, id: onClick2[onClick2Count % onClick2.length] });
  }
}

const handleClick3 = (id, chan) => {
  console.log("Click3", chan);
  const onClick3 = toArr(chan.onClick3);
  if (onClick3.length > 0) {
    const { onClick3Count = 0 } = chan;
    run({ type: ACTION_SCRIPT_RUN, id: onClick3[onClick3Count % onClick3.length] });
  }
}

const handleHold = (id, chan) => {
  console.log("Hold", chan);
  const onHold = toArr(chan.onHold);
  if (onHold.length > 0) {
    const { onHoldCount = 0 } = chan;
    run({ type: ACTION_SCRIPT_RUN, id: onHold[onHoldCount % onHold.length] });
  }
  return chan.repeat;
} 
