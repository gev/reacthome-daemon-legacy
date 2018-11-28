
const path = require('path');
const { ip, mac } = require('ip')();

module.exports.ip = ip;
module.exports.mac = mac;
module.exports.version = '5.1';

module.exports.SERVER_PORT = 2016;
module.exports.DEVICE_PORT = 2017;
module.exports.DEVICE_GROUP = '224.0.0.1';

module.exports.SERVICE_PORT = 2018;
module.exports.SERVICE_GROUP = '224.0.0.2';

module.exports.IP_ADDRESS = 0xc0a81202;
module.exports.IP_ADDRESS_POOL_START = 0xc0a81264;
module.exports.IP_ADDRESS_POOL_END = 0xc0a812fe;
module.exports.SUB_NET_MASK = 0xffffff00;

module.exports.DISCOVERY_INTERVAL = 1000;

module.exports.POOL = 'pool';
module.exports.STATE = 'state';
module.exports.DAEMON = 'daemon';
module.exports.DEVICE = 'device';
module.exports.CHANNEL = 'channel';
module.exports.SERVICE = 'service';
module.exports.IMAGE = 'image';

module.exports.DO = 'do';
module.exports.DI = 'di';
module.exports.DIM = 'dim';
module.exports.BUTTON = 'button';
module.exports.SMOCK_SENSOR = 'smock_sensor';
module.exports.MOTION_SENSOR = 'motion_sensor';
module.exports.LEAKAGE_SENSOR = 'leakage_sensor';
module.exports.VALVE_HEATING = 'valve_heating';
module.exports.VALVE_WATER = 'valve_water';
module.exports.SOCKET_220 = 'socket_220';
module.exports.BOILER = 'boiler';
module.exports.PUMP = 'pump';
module.exports.FAN = 'fan';
module.exports.TV = 'TV';


module.exports.STATE = 'state';

module.exports.ASSETS = 'assets';
module.exports.ASSETS_DIR = path.join('tmp', 'assets');
module.exports.asset = (a = '') => path.join(process.cwd(), 'tmp', 'assets', a);

module.exports.FIRMWARE = './firmware';
module.exports.DB = './db';

module.exports.ACTION_DO = 0x00;
module.exports.ACTION_DI = 0x01;
module.exports.ACTION_IR = 0x10;
module.exports.ACTION_PNP = 0x11;
module.exports.ACTION_DOPPLER = 0xb0;
module.exports.ACTION_TEMPERATURE = 0xc0;
module.exports.ACTION_TEMPERATURE_EXT = 0xc1;
module.exports.ACTION_HUMIDITY = 0xc2;
module.exports.ACTION_ILLUMINATION = 0xc3;
module.exports.ACTION_DIMMER = 0xd0;
module.exports.ACTION_RGB = 0xe0;
module.exports.ACTION_DISCOVERY = 0xf0;
module.exports.ACTION_READY = 0xf1;
module.exports.ACTION_INITIALIZE = 0xf2;
module.exports.ACTION_INITIALIZED = 0xf3;
module.exports.ACTION_FIND_ME = 0xfa;
module.exports.ACTION_BOOTLOAD = 0xfb;
module.exports.ACTION_MAC_ADDRESS = 0xfc;
module.exports.ACTION_IP_ADDRESS = 0xfd;
module.exports.ACTION_ERROR = 0xff;

module.exports.BOOTLOAD_WRITE = 0x00;
module.exports.BOOTLOAD_SUCCESS = 0x01;
module.exports.BOOTLOAD_FINISH = 0x0f;

module.exports.BOOTLOAD_WRITE = 0x00;
module.exports.BOOTLOAD_SUCCESS = 0x01;
module.exports.BOOTLOAD_FINISH = 0x0f;

module.exports.ACTION_SET = 'ACTION_SET';
module.exports.ACTION_INIT = 'ACTION_INIT';
module.exports.ACTION_DOWNLOAD = 'ACTION_DOWNLOAD';

module.exports.ACTION_RGB_SET = 'ACTION_RGB_SET';
module.exports.ACTION_LIGHT_ON = 'ACTION_LIGHT_ON';
module.exports.ACTION_LIGHT_OFF = 'ACTION_LIGHT_OFF';
module.exports.ACTION_LIGHT_SET = 'ACTION_LIGHT_SET';
module.exports.ACTION_LIGHT_SET_RELATIVE = 'ACTION_LIGHT_SET_RELATIVE';
module.exports.ACTION_SITE_LIGHT_SET_RELATIVE = 'ACTION_SITE_LIGHT_SET_RELATIVE';
module.exports.ACTION_SITE_LIGHT_OFF = 'ACTION_SITE_LIGHT_OFF';
module.exports.ACTION_SETPOINT = 'ACTION_SETPOINT';
module.exports.ACTION_TIMER_START = 'ACTION_TIMER_START';
module.exports.ACTION_TIMER_STOP = 'ACTION_TIMER_STOP';
module.exports.ACTION_DOPPLER_HANDLE = 'ACTION_DOPPLER_HANDLE';
module.exports.ACTION_TOGGLE = 'ACTION_TOGGLE';
module.exports.ACTION_TV = 'ACTION_TV';
module.exports.ACTION_SCRIPT_RUN = 'ACTION_SCRIPT_RUN';

module.exports.DIM_OFF = 0x0;
module.exports.DIM_ON = 0x1;
module.exports.DIM_SET = 0x2;
module.exports.DIM_FADE = 0x3;
module.exports.DIM_TYPE = 0x4;  

module.exports.PNP_ENABLE = 0x0;
module.exports.PNP_STEP = 0x1;

module.exports.DIM_TYPE_UNPLUGGED = 0x0;
module.exports.DIM_TYPE_RISING_EDGE = 0x1;
module.exports.DIM_TYPE_FALLING_EDGE = 0x2;
module.exports.DIM_TYPE_PWM = 0x3;
module.exports.DIM_TYPE_RELAY = 0x4;

module.exports.DEVICE_TYPE_UNKNOWN = 0x00;
module.exports.DEVICE_TYPE_SENSOR4 = 0x01;
module.exports.DEVICE_TYPE_SENSOR6 = 0x02;
module.exports.DEVICE_TYPE_THI = 0x03;
module.exports.DEVICE_TYPE_DOPPLER = 0x04;
module.exports.DEVICE_TYPE_DMX = 0x05;
module.exports.DEVICE_TYPE_RS485 = 0x06;
module.exports.DEVICE_TYPE_IR6 = 0x07;
module.exports.DEVICE_TYPE_DI16 = 0x08;
module.exports.DEVICE_TYPE_DI24 = 0x12;
module.exports.DEVICE_TYPE_DI32 = 0x09;
module.exports.DEVICE_TYPE_DO8 = 0x0a;
module.exports.DEVICE_TYPE_DO12 = 0x11;
module.exports.DEVICE_TYPE_DO16 = 0x0b;
module.exports.DEVICE_TYPE_DI16_DO8 = 0x0c;
module.exports.DEVICE_TYPE_DO8_DI16 = 0x0d;
module.exports.DEVICE_TYPE_DIM4 = 0x0e;
module.exports.DEVICE_TYPE_DIM8 = 0x0f;
module.exports.DEVICE_TYPE_PNP = 0xe0;
module.exports.DEVICE_TYPE_PLC = 0xfe;
module.exports.DEVICE_TYPE_BOOTLOADER = 0xff;
module.exports.DEVICE_TYPE_IR_RECEIVER = 0x10;

module.exports.onIR = 'onIR';
module.exports.onOff = 'onOff';
module.exports.onOn = 'onOn';
module.exports.onHold = 'onHold';
module.exports.onClick = 'onClick';
module.exports.onDoppler = 'onDoppler';
module.exports.onHighThreshold = 'onHighThreshold';
module.exports.onLowThreshold = 'onLowThreshold';
module.exports.onQuiet = 'onQuiet';
module.exports.onTemperature = 'onTemperature';
module.exports.onTemperatureExt = 'onTemperatureExt';
module.exports.onHumidity = 'onHumidity';
module.exports.onIllumination = 'onIllumination';

module.exports.OPERATOR_PLUS = 'OPERATOR_PLUS';
module.exports.OPERATOR_MINUS = 'OPERATOR_MINUS';
module.exports.OPERATOR_MUL = 'OPERATOR_MUL';
module.exports.OPERATOR_DIV = 'OPERATOR_DIV';
