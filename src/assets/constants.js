
const path = require('path');

const VAR = 'var';

const p = (type) => path.join(process.cwd(), VAR, type);

module.exports.ASSETS = p('assets');
module.exports.TMP = p('tmp');
