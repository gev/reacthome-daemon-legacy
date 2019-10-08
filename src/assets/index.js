
const { mkdir, readdir, stat, exists, asset } = require('./util');
const { DB, ASSETS, TMP, VAR } = require('./constants');

const init = (...path) => path.map(async (i) => (await exists(i)) || mkdir(i));

module.exports.init = async () => {
  await init(VAR);
  Promise.all(init(DB, ASSETS, TMP));
};

module.exports.list = async () => Promise.all(
  (await readdir(ASSETS))
    .map(async (i) => [i, (await stat(asset(i))).mtimeMs])
);
