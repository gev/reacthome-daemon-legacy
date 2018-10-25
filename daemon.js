
const Koa = require('koa');
const { state, assets, device, service } = require('./src/controllers');
const createStore = require('./src/store');
const reducer = require('./src/reducer');
const { set } = require('./src/actions');
const { mac, DAEMON, SERVICE_PORT, ACTION_SET, IMAGE } = require('./src/constants');
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
    const store = createStore(reducer, init);
    store.dispatch(set(mac, { type: DAEMON }));
    app.use(state.manage(store));
    app.use(assets.manage());
    app.listen(SERVICE_PORT);
    service.manage(store);
    device.manage(store);
  });
