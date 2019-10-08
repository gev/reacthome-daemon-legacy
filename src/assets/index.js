
const { readdir, stat, exists, asset, tmp } = require('./util');

module.exports.list = async () => Promise.all(
  (await readdir(asset()))
    .map(async (i) => [i, (await stat(asset(i))).mtimeMs])
);
