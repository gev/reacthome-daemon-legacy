
const path = require('path');
const { promisify } = require('util');
const { mkdir, readdir, stat, exists } = require('fs');
const { ASSETS, TMP } = require('./constants');

const p = (type) => (a = '') => path.join(type, a);

module.exports.tmp = p(TMP_DIR);
module.exports.asset = p(ASSETS_DIR);
module.exports.stat = promisify(stat);
module.exports.mkdir = promisify(mkdir);
module.exports.readdir = promisify(readdir);
module.exports.exists = file => new Promise(resolve => exists(file, resolve));
