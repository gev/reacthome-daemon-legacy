
const fs = require('fs');
const ip = require('ip')();
const { FILE } = require('./src/constants');
const manageDevices = require('./src/devices');
const discovery = require('./src/discovery');
const createStore = require('./src/store');
const reducer = require('./src/reducer');

const store = createStore(reducer, JSON.parse(fs.readFileSync(FILE)));

manageDevices(store, ip);
discovery(ip);
