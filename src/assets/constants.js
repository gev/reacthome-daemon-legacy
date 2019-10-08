
const path = require('path');

const DB = 'db';
const VAR = 'var';
const TMP = 'tmp';
const ASSETS = 'assets';

const p = (...s) => path.join(process.cwd(), ...s);

module.exports.VAR = p(VAR);
module.exports.DB = p(VAR, DB);
module.exports.TMP = p(VAR, TMP);
module.exports.ASSETS = p(VAR, ASSETS);
