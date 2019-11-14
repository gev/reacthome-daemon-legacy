
const Koa = require('koa');
const { v4 } = require('uuid');
const { state, assets, device, service, cpu, weather } = require('./src/controllers');
const { DAEMON, CLIENT_SERVER_PORT, ACTION_SET, ACTION_SCRIPT_RUN, IMAGE } = require('./src/constants');
const { get, set, count } = require('./src/actions');
const drivers = require('./src/drivers');
const mac = require('./src/mac');
const db = require('./src/db');

const init = {};

const start = () => {
  set(mac(), { type: DAEMON });
  const { project } = get(mac()) || {};
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
  .on('end', () => {
    const app = new Koa();
    if (!init.mac) {
      init.mac = v4();
      db.put('mac', init.mac);
    }
    state.init(init);
    app.use(state.manage());
    app.use(assets.manage());
    app.listen(CLIENT_SERVER_PORT);
    weather.manage();
    service.manage();
    device.manage();
    drivers.manage();
    cpu.manage();
    start();
  });
