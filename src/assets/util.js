
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { ASSETS, TMP } = require('./constants');

const p = (type) => (a = '') => path.join(type, a);

module.exports.tmp = p(TMP);
module.exports.asset = p(ASSETS);
module.exports.stat = promisify(fs.stat);
module.exports.mkdir = promisify(fs.mkdir);
module.exports.rename = promisify(fs.rename);
module.exports.unlink = promisify(fs.unlink);
module.exports.readdir = promisify(fs.readdir);
module.exports.appendFile = promisify(fs.appendFile);
module.exports.exists = file => new Promise(resolve => fs.exists(file, resolve));
