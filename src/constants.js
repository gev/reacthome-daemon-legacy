
const { ip, mac } = require('ip')();

module.exports.ip = ip;
module.exports.mac = mac;
module.exports.version = '5.1';

module.exports.DEVICE_PORT = 2017;
module.exports.DEVICE_GROUP = '224.0.0.1';

module.exports.SERVICE_PORT = 2018;
module.exports.SERVICE_GROUP = '224.0.0.2';

module.exports.IP_ADDRESS = 0xc0a81203;
module.exports.IP_ADDRESS_POOL_START = 0xc0a81264;
module.exports.IP_ADDRESS_POOL_END = 0xc0a812fe;
module.exports.SUB_NET_MASK = 0xffffff00;

module.exports.DISCOVERY_INTERVAL = 1000;

module.exports.STATE = 'state';
module.exports.DAEMON = 'daemon';
module.exports.DEVICE = 'device';
module.exports.CHANNEL = 'channel';
module.exports.SERVICE = 'service';

module.exports.FILE = './tmp/state.json';

module.exports.ACTION_DO = 0x00;
module.exports.ACTION_DIMMER = 0xd0;
module.exports.ACTION_DISCOVERY = 0xf0;
module.exports.ACTION_READY = 0xf1;
module.exports.ACTION_FIND_ME = 0xfa;
module.exports.ACTION_MAC_ADDRESS = 0xfc;
module.exports.ACTION_IP_ADDRESS = 0xfd;
module.exports.ACTION_BOOTLOAD = 0xfb;
module.exports.ACTION_ERROR = 0xff;

module.exports.BOOTLOAD_WRITE = 0x00;
module.exports.BOOTLOAD_SUCCESS = 0x01;
module.exports.BOOTLOAD_FINISH = 0x0f;

module.exports.BOOTLOAD_WRITE = 0x00;
module.exports.BOOTLOAD_SUCCESS = 0x01;
module.exports.BOOTLOAD_FINISH = 0x0f;

module.exports.ACTION_GET = 'ACTION_GET';
module.exports.ACTION_SET = 'ACTION_SET';

module.exports.FIRMWARE_PATH = '/Users/evgeny/workspace';
module.exports.FIRMWARE_PROJECT = 'pic-sensor.X';
module.exports.FIRMWARE_BUILD = 'production';

module.exports.DIM_OFF = 0x0;
module.exports.DIM_ON = 0x1;
module.exports.DIM_SET = 0x2;
module.exports.DIM_FADE = 0x3;
module.exports.DIM_TYPE = 0x4;

module.exports.DIM_TYPE_UNPLUGGED = 0x0;
module.exports.DIM_TYPE_RISING_EDGE = 0x1;
module.exports.DIM_TYPE_FALLING_EDGE = 0x2;
module.exports.DIM_TYPE_PWM = 0x3;
module.exports.DIM_TYPE_RELAY = 0x4;
