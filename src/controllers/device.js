
const crypto = require('crypto');
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
  ACTION_TEMPERATURE_EXT,
  ACTION_HUMIDITY,
  ACTION_ILLUMINATION,
  ACTION_DIMMER,
  ACTION_DOPPLER,
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
  CLOSE_OPEN
} = require('../constants');
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
  initialized
} = require('../actions');
const { device } = require('../sockets');
const { run } = require('./service');
const drivers = require('../drivers');
const mac = require('../mac');

const ip2int = ip => ip.split('.').reduce((a, b) => (a << 8) | (parseInt(b)), 0) >>> 0;
const int2ip = ip => `${ip >> 24 & 0xff}.${ip >> 16 & 0xff}.${ip >> 8 & 0xff}.${ip & 0xff}`;

const onDI = [onOff, onOn, onHold, onClick];
const onDO = [onOff, onOn];
const count = [count_off, count_on];

let last_ip = IP_ADDRESS_POOL_START;

module.exports.manage = () => {

  ((get(mac()) || {}).device || []).forEach(id => {
    offline(id);
  });

  device.handle((data, { address }) => {
    try {
      const dev_mac = Array.from(data.slice(0, 6));
      const id = dev_mac.map(i => `0${i.toString(16)}`.slice(-2)).join(':');
      const action = data[6];
      switch (action) {
        case DEVICE_TYPE_PLC: {
          for (let i = 1; i <= 36; i++ ) {
            const channel = `${id}/${DI}/${i}`;
            const chan = get(channel);
            const value = data[i + 6];
            if (chan && (chan.value !== value)) {
              set(channel, { value });
              const script = chan[onDI[value]];
              if (script) {
                run({ type: ACTION_SCRIPT_RUN, id: script });
              }
            }
          }
          for (let i = 1; i <= 24; i++ ) {
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
          const value = data[8];
          console.log(value);
          const channel = `${id}/${DI}/${index}`;
          const chan = get(channel);
          if (chan && (chan.value !== value)) {
            set(channel, { value });
            const script = chan[onDI[value]];
            if (script) {
              run({ type: ACTION_SCRIPT_RUN, id: script });
            }
          } else {
            set(channel, { value });
          }

          break;
        }
        case ACTION_DO: {
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
          };
          if (group && group.enabled) {
            if (value) {
              if (group === CLOSE_OPEN) {
                set(gid, {value: index % 2 === 1});
              } else {
                set(gid, {value: index % 2 === 0});
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
          drivers.handle({ id: bind, data: data.slice(8) })
          break;
        }
        case ACTION_DIMMER: {
          const [,,,,,,, index, type, value, velocity] = data;
          const channel = `${id}/${DIM}/${index}`;
          const chan = get(channel);
          set(channel, {
            type, value, velocity,
            dimmable: type ===  DIM_TYPE_FALLING_EDGE
                   || type === DIM_TYPE_RISING_EDGE
                   || type === DIM_TYPE_PWM
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
        case ACTION_TEMPERATURE: {
          const temperature = data.readUInt16LE(7) / 100;
          const { onTemperature, site } = get(id);
          if (site) set(site, { temperature });
          set(id, { temperature });
          if (onTemperature) {
            run({type: ACTION_SCRIPT_RUN, id: onTemperature});
          }
          break;
        }
        case ACTION_TEMPERATURE_EXT: {
          const dev_id = data.slice(7, 15).map(i => `0${i.toString(16)}`.slice(-2)).join(':');
          const temperature = data.readInt16LE(15) / 100;
          set(dev_id, { ip: address, online: true, temperature, type: DEVICE_TYPE_TEMPERATURE_EXT, version: '1.0' });
          add(mac(), DEVICE, dev_id);
          const { onTemperature: onTemperature, site } = get(dev_id);
          if (site) set(site, { temperature });
          if (onTemperature) {
            run({ type: ACTION_SCRIPT_RUN, id: onTemperature });
          }
          break;
        }
        case ACTION_HUMIDITY: {
          const humidity = data.readUInt16LE(7) / 100;
          const { onHumidity, site } = get(id);
          if (site) set(site, { humidity });
          set(id, { humidity });
          if (onHumidity) {
            run({type: ACTION_SCRIPT_RUN, id: onHumidity});
          }
          break;
        }
        case ACTION_ILLUMINATION: {
          const illumination = data.readUInt32LE(7) / 100;
          const { onIllumination, site } = get(id);
          if (site) set(site, { illumination });
          set(id, { illumination });
          if (onIllumination) {
            run({type: ACTION_SCRIPT_RUN, id: onIllumination});
          }
          break;
        }
        case ACTION_DOPPLER: {
          const [,,,,,,, value, gain ] = data;
          const { onDoppler, threshold } = get(id);
          set(id, { value, gain });
          if (onDoppler) {
            run({type: ACTION_SCRIPT_RUN, id: onDoppler});
          }
          break;
        }
        case ACTION_DOPPLER_RAW: {
          set(id, { raw: [...data.slice(7)] });
          break;
        }
        case ACTION_IR: {
          const value = [];
          const buff = data.slice(7);
          for (let i = 0; i < buff.length; i += 2) {
            const x = buff.readUInt16LE(i);
            value.push(x);
          }
          set(id, { value });
          break;
        }
        case ACTION_PNP: {
          const [,,,,,,, type] = data;
          switch (type) {
            case PNP_ENABLE:
              const enabled = Boolean(data[8]);
              set(id, { enabled, t1: Date.now() });
              break;
            case PNP_STEP:
              const [,,,,,,,, direction] = data;
              const step = data.readUInt16LE(9);
              set(id, { direction, step, t1: Date.now() });
              break
          }
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
            const pool =  Object.values(get(POOL) || {});
            while (last_ip < IP_ADDRESS_POOL_END) {
              if (!pool.includes(last_ip)) break;
              last_ip++;
            };
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
          online(id, type, version, address, action === ACTION_READY);
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
      console.error(e)
    }
  });
}
