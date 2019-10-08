
const { mkdir, readdir, stat, exists, asset, tmp } = require('./util');

const init = async (path) => (await exists(path)) || mkdir(path);

module.exports.init = () => Promise.all(
  init(asset()), init(tmp())
);

module.exports.list = async () => Promise.all(
  (await readdir(asset()))
    .map(async (i) => [i, (await stat(asset(i))).mtimeMs])
);
