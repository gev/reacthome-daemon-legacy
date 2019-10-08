
const path = require('path');
const { ASSETS, TMP } = require('./constants');

const p = (type) => (a = '') => path.join(process.cwd(), type, a);

module.exports.tmp = p(TMP);
module.exports.asset = p(ASSETS);
