
const Koa = require('koa');
const { state, assets, device, service, cpu, weather } = require('./src/controllers');
const { mac, DAEMON, CLIENT_SERVER_PORT, ACTION_SET, IMAGE } = require('./src/constants');
const { get, set, count, start } = require('./src/actions');
const db = require('./src/db');

const init = {};

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
    set(mac, { type: DAEMON });
    const { project } = get(mac);
    if (project) {
      count(project);
      start(project);
    }
    app.use(state.manage());
    app.use(assets.manage());
    app.listen(CLIENT_SERVER_PORT);
    weather.manage();
    service.manage();
    device.manage();
    cpu.manage();
  });
