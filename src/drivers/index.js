
const { mac, DRIVER_TYPE_RS21, DRIVER_TYPE_ARTNET } = require('../constants');
const { get } = require('../actions');
const RS21 = require('./RS21');
const Artnet = require('./artnet');

let run = {};

module.exports.manage = () => {
  // const { project } = get(mac) || {};
  const { project } = get('20:c9:d0:7f:aa:29') || {};
  if (project === undefined) return;
  const { driver } = get(project) || [];
  Object.entries(run).forEach(([id, drv]) => {
    if (drv.stop) drv.stop();
  });
  run = {};
  driver.forEach(id => {
    const { type } = get(id) || {};
    switch(type) {
      case DRIVER_TYPE_RS21:
        run[id] = new RS21(id);
        break;
      case DRIVER_TYPE_ARTNET:
        run[id] = new Artnet(id);
        break;
    }
  });
};

module.exports.handle = (action) => {
  if (run[action.id] && run[action.id].handle) {
    run[action.id].handle(action);
  }
}
