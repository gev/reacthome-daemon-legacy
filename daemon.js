
const Koa = require('koa');
const static = require('koa-static');
const { assets, device, service } = require('./src/controllers');
const createStore = require('./src/store');
const reducer = require('./src/reducer');
const { set } = require('./src/actions');
const { mac, DAEMON, SERVICE_PORT, ACTION_SET, IMAGE } = require('./src/constants');
const db = require('./src/db');

const state = {};

db.createReadStream()
  .on('error', (err) => {
    console.log(err)
  })
  .on('data', ({ key, value }) => {
    state[key] = value;
  })
  .on('end', () => {
    const app = new Koa();
    const store = createStore(reducer, state);
    store.dispatch(set(mac, { type: DAEMON }));
    app.use(static('./tmp/assets/'));
    app.use(async (ctx) => {
      await ctx.text();
      console.log(cts.request);
    });
    app.listen(SERVICE_PORT);
    service.manage(store);
    device.manage(store);
  })

