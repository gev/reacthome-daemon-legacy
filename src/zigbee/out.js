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

const move_to_level = (id, index) => async (id, index, level, transtime = 0) => {
  const device = controller.getDeviceByIeeeAddr(id);
  const endpoint = device.getEndpoint(Number.parseInt(index));
  await endpoint.command('genLevelCtrl', 'moveToLevelWithOnOff', {level,  transtime}, {});
};

const move_to_hue_saturation = (id, index) => async (id, index, enhancehue, saturation, direction = 0, transtime = 0) => {
  const device = controller.getDeviceByIeeeAddr(id);
  const endpoint = device.getEndpoint(Number.parseInt(index));
  await endpoint.command('lightingColorCtrl', 'enhancedMoveToHueAndSaturationen',  {enhancehue, saturation, direction, transtime}, {});
};


module.exports = {
  on_off, 
  on, 
  off,
  move_to_level,
  move_to_hue_saturation,
};
