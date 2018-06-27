
const { assets, device, service } = require('./src/controllers');
const createStore = require('./src/store');
const reducer = require('./src/reducer');
const { set } = require('./src/actions');
const { mac, DAEMON, SERVICE_PORT, ACTION_SET } = require('./src/constants');
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
    const store = createStore(reducer, state);
    store.dispatch(set(mac, { type: DAEMON }));
    service.manage(store);
    device.manage(store);
  })
