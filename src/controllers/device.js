
const crypto = require('crypto');
const {
  POOL,
  ACTION_DI,
  ACTION_DO,
  ACTION_TEMPERATURE,
  ACTION_TEMPERATURE_EXT,
  ACTION_HUMIDITY,
  ACTION_ILLUMINATION,
  ACTION_DIMMER,
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
  SUB_NET_MASK
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

const ip2int = ip => ip.split('.').reduce((a, b) => (a << 8) | (parseInt(b)), 0) >>> 0;
const int2ip = ip => `${ip >> 24 & 0xff}.${ip >> 16 & 0xff}.${ip >> 8 & 0xff}.${ip & 0xff}`;

let last_ip = IP_ADDRESS_POOL_START;

module.exports.manage = ({ dispatch, getState }) => {

  Object.keys(getState()[POOL] || {}).forEach(id => {
    dispatch(offline(id));
  });

  device.handle((data, { address }) => {
    const mac = Array.from(data.slice(0, 6));
    const id = mac.map(i => `0${i.toString(16)}`.slice(-2)).join(':');
    const action = data[6];
    switch (action) {
      case ACTION_DI: 
      case ACTION_DO: {
        const index = data[7];
        const value = data[8];
        const channel = `${id}/${index}`;
        dispatch(set(channel, { value }));
        break;
      }
      case ACTION_DIMMER: {
        const [,,,,,,, index, type, value, velocity] = data;
        const channel = `${id}/${index}`;
        dispatch(set(channel, { type, value, velocity }));
        break;
      }
      case ACTION_TEMPERATURE: {
        const temperature = data.readUInt16LE(7) / 100;
        dispatch(set(id, { temperature }));
        break;
      }
      case ACTION_TEMPERATURE_EXT: {
        const temperature_ext = data.readUInt16LE(7) / 100;
        dispatch(set(id, { temperature_ext }));
        break;
      }
      case ACTION_HUMIDITY: {
        const humidity = data.readUInt16LE(7) / 100;
        dispatch(set(id, { humidity }));
        break;
      }
      case ACTION_ILLUMINATION: {
        const illumination = data.readUInt16LE(7) / 100;
        dispatch(set(id, { illumination }));
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
  });
}

