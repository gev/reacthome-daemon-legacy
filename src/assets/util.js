
const path = require('path');
const { promisify } = require('util');
const { readdir, stat, exists } = require('fs');
const { ASSETS, TMP } = require('./constants');

const p = (type) => (a = '') => path.join(process.cwd(), type, a);

module.exports.tmp = p(TMP);
module.exports.asset = p(ASSETS);
module.exports.stat = promisify(stat);
module.exports.readdir = promisify(readdir);
module.exports.exists = file => new Promise(resolve => exists(file, resolve));
