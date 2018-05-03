
const fs = require('fs');
const { assets, device, service } = require('./src/controllers');
const createStore = require('./src/store');
const reducer = require('./src/reducer');
const { set } = require('./src/actions');
const { mac, DAEMON, SERVICE_PORT, FILE } = require('./src/constants');

const store = createStore(reducer, JSON.parse(fs.readFileSync(FILE)));
store.dispatch(set(mac, { type: DAEMON }));
service.manage(store);
device.manage(store);
