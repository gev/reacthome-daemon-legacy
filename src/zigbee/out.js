const { ON, OFF } = require('../constants');
const controller = require('./controller');

const on_off = (id, index, value) => {
  try {
    const device = controller.getDeviceByIeeeAddr(id);
    const endpoint = device.getEndpoint(Number.parseInt(index));
    endpoint.command('genOnOff', value ? 'on' : 'off', {});
  } catch (e) {
    console.error(e);
  }
};

const on = (id, index) => on_off(id, index, ON);
const off = (id, index) => on_off(id, index, OFF);

module.exports = { on_off, on, off };
