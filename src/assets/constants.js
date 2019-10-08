
const path = require('path');

const VAR = 'var';
const TMP = 'tmp';
const ASSETS = 'assets';

const p = (...s) => path.join(process.cwd(), ...s);

module.exports.VAR = p(VAR);
module.exports.TMP = p(VAR, TMP);
module.exports.ASSETS = p(VAR, ASSETS);
