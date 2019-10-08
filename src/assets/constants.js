
const path = require('path');

const p = (type) => path.join(process.cwd(), type);

module.exports.ASSETS = p('assets');
module.exports.TMP = p('tmp');
