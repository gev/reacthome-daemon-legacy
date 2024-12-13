const { mkdir, readdir, stat, exists, asset } = require('../fs');
const { DB, ASSETS, TMP, VAR } = require('./constants');

const init = async (...path) => {
  for (const i of path) {
    (await exists(i)) || mkdir(i);
  }
};

module.exports.init = async () => {
  await init(VAR);
  Promise.all(init(DB, ASSETS, TMP));
};
