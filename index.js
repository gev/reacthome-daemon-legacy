
const fs = require('fs');
const { FILE } = require('./src/constants');
const { manageDevice, manageService } = require('./src/controllers');
const createStore = require('./src/store');
const reducer = require('./src/reducer');
const { set } = require('./src/actions');
const { mac, DAEMON } = require('./src/constants');

const store = createStore(reducer, JSON.parse(fs.readFileSync(FILE)));
store.dispatch(set(mac, { type: DAEMON }));
manageService(store);
manageDevice(store);
