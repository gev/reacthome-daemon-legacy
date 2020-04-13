const { ON, OFF } = require('../constants');
const controller = require('./controller');

const on_off = async (id, index, value) => {
  try {
    const device = controller.getDeviceByIeeeAddr(id);
    const endpoint = device.getEndpoint(Number.parseInt(index));
    await endpoint.command('genOnOff', value ? 'on' : 'off', {});
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

const move_to_hue = async (id, index, enhancehue, direction = 1, transtime = 10) => {
  const device = controller.getDeviceByIeeeAddr(id);
  const endpoint = device.getEndpoint(Number.parseInt(index));
  await endpoint.command('lightingColorCtrl', 'enhancedMoveToHue',  {enhancehue, direction, transtime}, {});
};

const move_to_saturation = async (id, index, saturation, transtime = 0) => {
  const device = controller.getDeviceByIeeeAddr(id);
  const endpoint = device.getEndpoint(Number.parseInt(index));
  await endpoint.command('lightingColorCtrl', 'moveToSaturation',  {saturation, transtime}, {});
};


module.exports = {
  on_off, 
  on, 
  off,
  move_to_hue,
  move_to_saturation,
  move_to_hue_saturation,
  move_to_level,
};
