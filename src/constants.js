
module.exports = {
  DEVICE_PORT         : 2017,
  DISCOVERY_GROUP     : '224.0.0.1',
  APPLICATION_PORT    : 2018,
  APPLICATION_GROUP   : '224.0.0.2',
  DEFAULT_MAC_ADDRESS : '02:02:02:02:02:02',

  FILE                : './tmp/state.json',
  
  ACTION_DISCOVERY    : 0xF0,
  ACTION_READY        : 0xF1,
  ACTION_MAC_ADDRESS  : 0xFC,
  ACTION_ERROR        : 0xFF,

  DISCOVERY_INTERVAL  : 1000,

  STATE               : 'STATE',
  DEVICE              : 'DEVICE'
};