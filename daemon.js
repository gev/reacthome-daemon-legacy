
const { v4 } = require('uuid');
const { DAEMON, CLIENT_SERVER_PORT, ACTION_SET, ACTION_SCRIPT_RUN, ACTION_SCHEDULE_START, ACTION_TIMER_START, IMAGE } = require('./src/constants');
const { state, device, service, cpu, weather } = require('./src/controllers');
const { get, set, count } = require('./src/actions');
const discovery = require('./src/discovery');
const drivers = require('./src/drivers');
const assets = require('./src/assets');
const webrtc = require('./src/webrtc');
const janus = require('./src/janus');
const ping = require('./src/ping');
const sip = require('./src/sip');
const db = require('./src/db');

const init = {};

const start = (id) => {
  set(id, { type: DAEMON });
  const { project } = get(id) || {};
  if (project) {
    count(project);
    const { timer = [], schedule = [] } = get(project) || {};
    schedule.forEach(id => {
      const { script, state, schedule } = get(id) || {};
      if (state && schedule && script) {
        service.run({ id, type: ACTION_SCHEDULE_START, schedule, script });
      }
    });
    timer.forEach(id => {
      const { script, state, time = 0, timestamp = 0 } = get(id) || {};
      if (state && script) {
        let dt = Date.now() - timestamp;
        if (dt < time) {
          dt = time - dt;
        } else {
          dt = 0;
          service.run({ id, type: ACTION_TIMER_START, time: dt, script });
        }
      }
    });
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
  .on('end', async () => {
    if (!init.mac) {
      init.mac = v4();
      db.put('mac', init.mac);
    }
    await assets.init();
    state.init(init);
    weather.manage();
    device.manage();
    drivers.manage();
    cpu.manage();
    discovery.start(init.mac);
    webrtc.start(init.mac);
    janus.start();
    ping.start();
    sip.start();
    start(init.mac);
  });
