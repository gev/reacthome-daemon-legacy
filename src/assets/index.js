
const { mkdir, readdir, stat, exists, asset } = require('./util');
const { ASSETS, TMP } = require('./constants');

const init = (...path) => path.map(async (i) => (await exists(i)) || mkdir(i));

module.exports.init = () => Promise.all(init(ASSETS, TMP));

module.exports.list = async () => Promise.all(
  (await readdir(ASSETS))
    .map(async (i) => [i, (await stat(asset(i))).mtimeMs])
);
