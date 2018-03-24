
const { createSocket } = require('dgram');
const crypto = require('crypto');
const {
  ACTION_DO,
  ACTION_DIMMER,
  ACTION_IP_ADDRESS,
  ACTION_MAC_ADDRESS,
  ACTION_DISCOVERY,
  ACTION_READY,
  ACTION_ERROR,
  ACTION_FIND_ME,
  ACTION_BOOTLOAD,
  DISCOVERY_INTERVAL,
  DEVICE,
  CHANNEL,
  DEVICE_PORT,
  DEVICE_GROUP,
  DEVICE_TYPE_UNKNOWN,
  IP_ADDRESS,
  IP_ADDRESS_POOL_START,
  IP_ADDRESS_POOL_END,
  SUB_NET_MASK
} = require('../constants');
const { set, offline, online, updateFirmware } = require('../actions');

const ip2int = ip => ip.split('.').reduce((a, b) => (a << 8) | (parseInt(b)), 0) >>> 0;
const int2ip = ip => `${ip >> 24 & 0xff}.${ip >> 16 & 0xff}.${ip >> 8 & 0xff}.${ip & 0xff}`;

const timeout = {};
let last_ip = IP_ADDRESS_POOL_START;

module.exports = ({ dispatch, getState }) => {

  Object.keys(getState().device || {}).forEach(id => {
    dispatch(offline(id));
  });

  const socket = createSocket('udp4')
    .on('message', (data, { address }) => {
      function send(buff, addr = address) {
        socket.send(buff, DEVICE_PORT, addr);
      };
      const mac = Array.from(data.slice(0, 6));
      const id = mac.map(i => `0${i.toString(16)}`.slice(-2)).join(':');
      const action = data[6];
      
      switch (action) {
        case ACTION_DO: {
          const index = data[7];
          const value = Boolean(data[8]);
          const channel = `${id}.${index}`;
          dispatch(set(CHANNEL, channel, { value }));
          break;
        }
        case ACTION_DIMMER: {
          const [,,,,,,, index, type, value, velocity] = data;
          const channel = `${id}.${index}`;
          dispatch(set(CHANNEL, channel, { type, value, velocity }));
          break;
        }
        case ACTION_IP_ADDRESS:
        case ACTION_MAC_ADDRESS:
        case ACTION_DISCOVERY:
        case ACTION_READY: {
          const type = data[7];
          const version = `${data[8]}.${data[9]}`;
          switch (action) {
            case ACTION_IP_ADDRESS: 
              const devices = getState()[DEVICE] || {};
              const lookup = ((devices)[id] || {}).ip;
              if (lookup) {
                const buff = Buffer.alloc(15);
                buff.writeUInt8(ACTION_IP_ADDRESS, 0);
                Buffer.from(mac).copy(buff, 1, 0, 6);
                buff.writeUInt32BE(ip2int(lookup), 7);
                buff.writeUInt32BE(SUB_NET_MASK, 11);
                send(buff, DEVICE_GROUP);
              } else if (last_ip < IP_ADDRESS_POOL_END) {
                const buff = Buffer.alloc(15);
                buff.writeUInt8(ACTION_IP_ADDRESS, 0);
                Buffer.from(mac).copy(buff, 1, 0, 6);
                const pool = Object.values(devices).map(i => ip2int(i.ip));
                while (last_ip < IP_ADDRESS_POOL_END) {
                  if (!pool.includes(last_ip)) break;
                  last_ip++;
                };
                buff.writeUInt32BE(last_ip, 7);
                buff.writeUInt32BE(SUB_NET_MASK, 11);
                dispatch(set(DEVICE, id, { ip: int2ip(last_ip) }))
                send(buff, DEVICE_GROUP);
              }
              break;
            case ACTION_MAC_ADDRESS:
              crypto.randomBytes(7, (err, a) => {
                if (err) console.log(err);
                else {
                  a[0] = ACTION_MAC_ADDRESS;
                  a[1] &= 0b11111110;
                  a[1] |= 0b00000010;
                  send(a);
                }
              });
              break;
            case ACTION_DISCOVERY: 
              dispatch(online(id, type, version, address, false));
              break;
            case ACTION_READY:
              dispatch(online(id, type, version, address, true));
              break;
          }
          break;
        }
        case ACTION_FIND_ME: {
          dispatch(set(DEVICE, id, { finding: !!data[7] }))
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
              dispatch(set(DEVICE, id, { pending: false, updating: false }))
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
  })
    .on('error', console.error)
    .bind(() => {
      const data = Buffer.alloc(7);
      data.writeUInt8(ACTION_DISCOVERY, 0);
      data.writeUInt32BE(IP_ADDRESS, 1);
      data.writeUInt16BE(socket.address().port, 5);
      setInterval(() => {
        socket.send(data, DEVICE_PORT, DEVICE_GROUP);
      }, DISCOVERY_INTERVAL);
    });

}
