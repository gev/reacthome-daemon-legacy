
const { v4 } = require('uuid');
const { state, assets, device, service, cpu, weather } = require('./src/controllers');
const { DAEMON, CLIENT_SERVER_PORT, ACTION_SET, ACTION_SCRIPT_RUN, IMAGE } = require('./src/constants');
const { get, set, count } = require('./src/actions');
const discovery = require('./src/discovery');
const drivers = require('./src/drivers');
const webrtc = require('./src/webrtc');
const ping = require('./src/ping');
const db = require('./src/db');

const init = {};

const start = (id) => {
  set(id, { type: DAEMON });
  const { project } = get(id) || {};
  if (project) {
    count(project);
    const { onStart } = get(project) || {};
    if (onStart) {
      setTimeout(() => {
        service.run({ type: ACTION_SCRIPT_RUN, id: onStart });
      }, 2000);
    }
  }
};

db.createReadStream()
  .on('error', (err) => {
    console.error(err)
  })
  .on('data', ({ key, value }) => {
    init[key] = value;
  })
  .on('end', () => {
    if (!init.mac) {
      init.mac = v4();
      db.put('mac', init.mac);
    }
    state.init(init);
    weather.manage();
    device.manage();
    drivers.manage();
    cpu.manage();
    discovery(init.mac);
    webrtc(init.mac);
    start(init.mac);
    ping();
  });
