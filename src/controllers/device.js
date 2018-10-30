
const crypto = require('crypto');
const {
  mac,
  DO,
  DI,
  DIM,
  POOL,
  ACTION_DI,
  ACTION_DO,
  ACTION_IR,
  ACTION_TEMPERATURE,
  ACTION_TEMPERATURE_EXT,
  ACTION_HUMIDITY,
  ACTION_ILLUMINATION,
  ACTION_DIMMER,
  ACTION_DOPPLER,
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
  DEVICE_GROUP, 
  DEVICE_TYPE_UNKNOWN,
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
  onTemperatureExt
} = require('../constants');
const {
  set,
  offline,
  online,
  updateFirmware,
  initialize,
  initialized
} = require('../actions');
const { device } = require('../sockets');
const { run } = require('./service');
  
const ip2int = ip => ip.split('.').reduce((a, b) => (a << 8) | (parseInt(b)), 0) >>> 0;
const int2ip = ip => `${ip >> 24 & 0xff}.${ip >> 16 & 0xff}.${ip >> 8 & 0xff}.${ip & 0xff}`;

const onDI = [onOff, onOn, onHold, onClick];
const onDO = [onOff, onOn];

let last_ip = IP_ADDRESS_POOL_START;

module.exports.manage = ({ dispatch, getState }) => {

  ((getState()[mac] || {}).device || []).forEach(id => {
    dispatch(initialize(id));
    dispatch(offline(id));
  });

  device.handle((data, { address }) => {
    try {
      const mac = Array.from(data.slice(0, 6));
      const id = mac.map(i => `0${i.toString(16)}`.slice(-2)).join(':');
      const action = data[6];
      switch (action) {
        case ACTION_DI: {
          const index = data[7];
          const value = data[8];
          // console.log(index, value);
          const channel = `${id}/${DI}/${index}`;
          const chan = getState()[channel];
          dispatch(set(channel, { value }));
          if (chan && (chan.value !== value)) {
            const script = chan[onDI[value]];
            if (script) {
              dispatch(run({ type: ACTION_SCRIPT_RUN, id: script }));
            }
          }
          break;
        }
        case ACTION_DO: {
          const index = data[7];
          const value = data[8];
          const channel = `${id}/${DO}/${index}`;
          const chan = getState()[channel];
          dispatch(set(channel, { value }));
          if (chan && (chan.value !== value)) {
            const script = chan[onDO[value]];
            if (script) {
              dispatch(run({ type: ACTION_SCRIPT_RUN, id: script }));
            }
          }
          break;
        }
        case ACTION_DIMMER: {
          function toggle(site, s) {
            const { light_on = 0, parent } = getState()[site];
            dispatch(set(site, { light_on: light_on + s}));
            if (parent) toggle(parent, s);
          }
          const [,,,,,,, index, type, value, velocity = 150] = data;
          const channel = `${id}/${DIM}/${index}`;
          const chan = getState()[channel];
          dispatch(set(channel, { type, value, velocity }));
          if (chan) {
            const { bind } = chan;
            if (bind) {
              const on_ = !!value;
              const { site, on = false } = getState()[bind];
              dispatch(set(bind, { on: on_, value }));
              if (on !== on_) {
                toggle(site, on ? 1 : -1);
              }
            }
            const v = value ? 1 : 0;
            const v_ = chan.value ? 1 : 0;
            if (v !== v_) {
              const script = chan[onDO[v]];
              if (script) {
                dispatch(run({ type: ACTION_SCRIPT_RUN, id: script }));
              }
            }
          }
          break;
        }
        case ACTION_TEMPERATURE: {
          const temperature = data.readUInt16LE(7) / 100;
          const { onTemperature, site } = getState()[id];
          if (site) dispatch(set(site, { temperature }));
          dispatch(set(id, { temperature }));
          if (onTemperature) {
            dispatch(run({type: ACTION_SCRIPT_RUN, id: onTemperature}));
          }
          break;
        }
        case ACTION_TEMPERATURE_EXT: {
          const temperature_ext = data.readUInt16LE(7) / 100;
          const { onTemperatureExt, site } = getState()[id];
          if (site) dispatch(set(site, { temperature_ext }));
          dispatch(set(id, { temperature_ext }));
          if (onTemperatureExt) {
            dispatch(run({type: ACTION_SCRIPT_RUN, id: onTemperatureExt}));
          }
          break;
        }
        case ACTION_HUMIDITY: {
          const humidity = data.readUInt16LE(7) / 100;
          const { onHumidity, site } = getState()[id];
          if (site) dispatch(set(site, { humidity }));
          dispatch(set(id, { humidity }));
          if (onHumidity) {
            dispatch(run({type: ACTION_SCRIPT_RUN, id: onHumidity}));
          }
          break;
        }
        case ACTION_ILLUMINATION: {
          const illumination = data.readUInt16LE(7) / 100;
          const { onIllumination, site } = getState()[id];
          if (site) dispatch(set(site, { illumination }));
          dispatch(set(id, { illumination }));
          if (onIllumination) {
            dispatch(run({type: ACTION_SCRIPT_RUN, id: onIllumination}));
          }
          break;
        }
        case ACTION_DOPPLER: {
          const [,,,,,,, value, gain ] = data;
          const { onDoppler, threshold } = getState()[id];
          dispatch(set(id, { value, gain }));
          if (onDoppler) {
            dispatch(run({type: ACTION_SCRIPT_RUN, id: onDoppler}));
          }
          break;
        }
        case ACTION_IR: {
          const value = [];
          const buff = data.slice(7);
          for (let i = 0; i < buff.length; i += 2) {
            const x = buff.readUInt16LE(i);
            value.push(x);
          }
          dispatch(set(id, { value }));
          break;
        }
        case ACTION_PNP: {
          const [,,,,,,, type] = data;
          switch (type) {
            case PNP_ENABLE:
              const enabled = Boolean(data[8]);
              dispatch(set(id, { enabled, t1: Date.now() }));
              break;
            case PNP_STEP:
              const [,,,,,,,, direction] = data;
              const step = data.readUInt16LE(9);
              dispatch(set(id, { direction, step, t1: Date.now() }));
              break
          }
          break;
        }
        case ACTION_INITIALIZE: {
          dispatch(initialize(id));
          break;
        }
        case ACTION_INITIALIZED: {
          dispatch(initialized(id));
          break;
        }
        case ACTION_IP_ADDRESS: {   
          const lookup = (getState()[POOL] || {})[id];
          if (lookup) {
            const buff = Buffer.alloc(15);
            buff.writeUInt8(ACTION_IP_ADDRESS, 0);
            Buffer.from(mac).copy(buff, 1, 0, 6);
            buff.writeUInt32BE(lookup, 7);
            buff.writeUInt32BE(SUB_NET_MASK, 11);
            device.send(buff, DEVICE_GROUP);
          } else if (last_ip < IP_ADDRESS_POOL_END) {
            const buff = Buffer.alloc(15);
            buff.writeUInt8(ACTION_IP_ADDRESS, 0);
            Buffer.from(mac).copy(buff, 1, 0, 6);
            const pool =  Object.values(getState()[POOL] || {});
            while (last_ip < IP_ADDRESS_POOL_END) {
              if (!pool.includes(last_ip)) break;
              last_ip++;
            };
            dispatch(set(POOL, { [id]: last_ip }));
            buff.writeUInt32BE(last_ip, 7);
            buff.writeUInt32BE(SUB_NET_MASK, 11);
            device.send(buff, DEVICE_GROUP);
          }
          break;
        }
        case ACTION_MAC_ADDRESS: {
          console.error(id, address, action);
          crypto.randomBytes(7, (err, a) => {
            if (err) console.log(err);
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
          console.log(id, address, action);
          const version = `${data[8]}.${data[9]}`;
          dispatch(online(id, type, version, address, action === ACTION_READY));
          break;
        }
        case ACTION_FIND_ME: {
          dispatch(set(id, { finding: !!data[7] }))
          break;
        }
        case ACTION_BOOTLOAD: {
          dispatch(updateFirmware(id));
          break;
        }
        case ACTION_ERROR: {
          const reason = data[7];
          switch (reason) {
            case ACTION_BOOTLOAD:
              dispatch(set(id, { pending: false, updating: false }))
              break;
            default: {
              console.log(data);    
            }
          }
        }
        default: {
          // console.log(data);
        }
      }
    } catch (e) {
      console.log(e)
    }
  });
}

