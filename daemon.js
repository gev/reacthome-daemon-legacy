
const Koa = require('koa');
const { state, assets, device, service, cpu, weather } = require('./src/controllers');
const { mac, DAEMON, CLIENT_SERVER_PORT, ACTION_SET, ACTION_SCRIPT_RUN, IMAGE } = require('./src/constants');
const { get, set, count } = require('./src/actions');
const db = require('./src/db');

const init = {};

const start = () => {
  set(mac, { type: DAEMON });
  const { project } = get(mac);
  if (project) {
    const { onStart } = get(project) || {};
    if (onStart) {
      service.run({ type: ACTION_SCRIPT_RUN, id: onStart });
    }
    count(project);
  }
}

db.createReadStream()
  .on('error', (err) => {
    console.log(err)
  })
  .on('data', ({ key, value }) => {
    init[key] = value;
  })
  .on('end', () => {
    const app = new Koa();
    state.init(init);
    app.use(state.manage());
    app.use(assets.manage());
    app.listen(CLIENT_SERVER_PORT);
    weather.manage();
    service.manage();
    device.manage();
    cpu.manage();
    start();
  });
