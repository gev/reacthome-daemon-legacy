const {
  ACTION_DO,
  ACTION_ON,
  ACTION_OFF,
} = require('../constants');
const controller = require('./controller');

module.exports = (action) => {
  try {
    switch (action.type) {
      case ACTION_DO: {
        const {id, index, value} = action;
        const device = controller.getDeviceByIeeeAddr(id);
        const endpoint = device.getEndpoint(Number.parseInt(index));
        endpoint.command('genOnOff', value ? 'on' : 'off', {});
        break;
      }
      case ACTION_ON: {
        break;
      }
      case ACTION_OFF: {
        break;
      }
    }
  } catch (e) {
    console.error(e);
  }
};
