
const fs = require('fs');
const { FILE } = require('./src/constants');
const { manageDevice, manageService } = require('./src/controllers');
const createStore = require('./src/store');
const reducer = require('./src/reducer');

const store = createStore(reducer, JSON.parse(fs.readFileSync(FILE)));

manageService(store);
manageDevice(store);
