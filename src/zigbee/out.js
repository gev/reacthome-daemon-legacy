const { debounce } = require('debounce');
const { get } = require('../actions');
const { ON, OFF, ACTION_OPEN, ACTION_CLOSE, ACTION_STOP } = require('../constants');
const controller = require('./controller');

let transid = 0;

const convertDecimalValueTo4BytesArray = v =>
  [v >> 24 & 0xff, v >> 16 & 0xff, v >> 8 & 0xff, v & 0xff];

const on_off = async (id, index, value) => {
  try {
    const device = controller.getDeviceByIeeeAddr(id);
    const endpoint = device.getEndpoint(Number.parseInt(index));
    if (device.modelID === '88teujp\u0000') {
      await endpoint.command(
        'manuSpecificTuya',
        'setData',
        {
          status: 0,
          transid,
          dp: 101,
          datatype: 1,
          length_hi: 0,
          length_lo: 1,
          data: [value ? 1 : 0],
        },
        {disableDefaultResponse: true}
      );
    } else {
      await endpoint.command('genOnOff', value ? 'on' : 'off', {});
    }
  } catch (e) {
    console.error(id, index, value, e);
  }
};

const on = (id, index) => on_off(id, index, ON);
const off = (id, index) => on_off(id, index, OFF);

const move_to_level = async (id, index, level, transtime = 0) => {
  const device = controller.getDeviceByIeeeAddr(id);
  const endpoint = device.getEndpoint(Number.parseInt(index));
  await endpoint.command('genLevelCtrl', 'moveToLevelWithOnOff', {level,  transtime}, {});
};

const move_to_hue_saturation = async (id, index, enhancehue, saturation, direction = 0, transtime = 0) => {
  const device = controller.getDeviceByIeeeAddr(id);
  const endpoint = device.getEndpoint(Number.parseInt(index));
  await endpoint.command('lightingColorCtrl', 'enhancedMoveToHueAndSaturation',  {enhancehue, saturation, direction, transtime}, {});
};

const move_to_hue = async (id, index, hue, direction = 0, transtime = 0) => {
  const device = controller.getDeviceByIeeeAddr(id);
  const endpoint = device.getEndpoint(Number.parseInt(index));
  await endpoint.command('lightingColorCtrl', 'moveToHue',  {hue, direction, transtime}, {});
};

const move_to_saturation = async (id, index, saturation, transtime = 0) => {
  const device = controller.getDeviceByIeeeAddr(id);
  const endpoint = device.getEndpoint(Number.parseInt(index));
  await endpoint.command('lightingColorCtrl', 'moveToSaturation',  {saturation, transtime}, {});
};

const zclCmdLookup = {
  [ACTION_OPEN]: 'upOpen',
  [ACTION_CLOSE]: 'downClose',
  [ACTION_STOP]: 'stop',
  'open': 'upOpen',
  'close': 'downClose',
  'stop': 'stop',
  'on': 'upOpen',
  'off': 'downClose',
};

const closure = async (id, index, action) => {
  const device = controller.getDeviceByIeeeAddr(id);
  const endpoint = device.getEndpoint(Number.parseInt(index));
  await endpoint.command('closuresWindowCovering', zclCmdLookup[action], {});
};

const setpoint = async (id, index, value) => {
  const device = controller.getDeviceByIeeeAddr(id);
  const endpoint = device.getEndpoint(Number.parseInt(index));
  const data = convertDecimalValueTo4BytesArray(value * 10); 
  transid += 1;
  transid %= 255;
  await endpoint.command(
    'manuSpecificTuya',
    'setData',
    {
      status: 0,
      transid,
      dp: 103,
      datatype: 2,
      length_hi: 0,
      length_lo: 4,
      data,
    },
    {disableDefaultResponse: true}
  );
};

const DEBOUNCE = 1000;

module.exports = {
  on_off: debounce(on_off, DEBOUNCE),
  on: debounce(on, DEBOUNCE),
  off: debounce(off, DEBOUNCE),
  move_to_hue: debounce(move_to_hue, DEBOUNCE),
  move_to_saturation: debounce(move_to_saturation, DEBOUNCE),
  move_to_hue_saturation: debounce(move_to_hue_saturation, DEBOUNCE),
  move_to_level: debounce(move_to_level, DEBOUNCE),
  closure: debounce(closure, DEBOUNCE),
  setpoint: debounce(setpoint, DEBOUNCE),
};
