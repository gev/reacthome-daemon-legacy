
const Koa = require('koa');
const { state, assets, device, service } = require('./src/controllers');
const { set } = require('./src/actions');
const { mac, DAEMON, CLIENT_PORT, ACTION_SET, IMAGE } = require('./src/constants');
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
    app.use(state.manage());
    app.use(assets.manage());
    app.listen(CLIENT_PORT);
    service.manage();
    device.manage();
  });
