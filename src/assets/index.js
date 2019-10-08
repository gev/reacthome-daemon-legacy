
const { mkdir, readdir, stat, exists, asset, tmp } = require('./util');

const init = (...path) => path.map(async (i) => (await exists(i)) || mkdir(i));

module.exports.init = () => Promise.all(init(asset(), tmp()));

module.exports.list = async () => Promise.all(
  (await readdir(asset()))
    .map(async (i) => [i, (await stat(asset(i))).mtimeMs])
);
