
const {
  DRIVER_TYPE_RS21,
  DRIVER_TYPE_ARTNET,
  DRIVER_TYPE_BB_PLC1,
  DRIVER_TYPE_BB_PLC2,
  DRIVER_TYPE_M206,
  DRIVER_TYPE_M230,
  DRIVER_TYPE_MODBUS,
  DRIVER_TYPE_VARMANN,
} = require('../constants');
const { get } = require('../actions');
const RS21 = require('./RS21');
const Artnet = require('./artnet');
const { Plc1, Plc2 } = require('./bb');
const M230 = require('./M230');
const M206 = require('./M206');
const modbus = require('./modbus');
const varmann = require('./varmann');
const mac = require('../mac');

let run = {};

module.exports.manage = () => {
  const { project } = get(mac()) || {};
  if (project === undefined) return;
  const { driver } = get(project);
  Object.entries(run).forEach(([id, drv]) => {
    if (drv.stop) drv.stop();
  });
  run = {};
  varmann.clear();
  if (!Array.isArray(driver)) return;
  driver.forEach(id => {
    const { type } = get(id) || {};
    switch(type) {
      case DRIVER_TYPE_RS21:
        run[id] = new RS21(id);
        break;
      case DRIVER_TYPE_ARTNET:
        run[id] = new Artnet(id);
        break;
      case DRIVER_TYPE_BB_PLC1:
        run[id] = new Plc1(id);
        break;
      case DRIVER_TYPE_BB_PLC2:
        run[id] = new Plc2(id);
        break;
      case DRIVER_TYPE_M206:
        run[id] = new M206(id);
        break;
      case DRIVER_TYPE_M230:
        run[id] = new M230(id);
        break;
      case DRIVER_TYPE_MODBUS:
        run[id] = modbus;
        break;
      case DRIVER_TYPE_VARMANN:
        run[id] = varmann;
        varmann.add(id);
        break;
      }
  });
};

module.exports.handle = (action) => {
  if (run[action.id] && run[action.id].handle) {
    run[action.id].handle(action);
  }
}