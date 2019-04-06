
const { mac, DRIVER_TYPE_RS21 } = require('../constants');
const RS21 = require('./rs21');

const run = {};

module.exports.manage = () => {
  const { project } = get(mac) || {};
  if (project === undefined) return;
  const driver = get(project) || []
  driver.forEach(id => {
    if (run[id] === undefined) return;
    const { type } = get(id) || {};
    switch(type) {
      case DRIVER_TYPE_RS21:
        run[id] = new RS21(id);
        break;
    }
  });
  Object.entries(run).forEach(([id, drv]) => {
    if (!driver.includes(id)) {
      drv.stop();
    }
  });
};
