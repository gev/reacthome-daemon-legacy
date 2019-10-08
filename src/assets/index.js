
const fs = require('fs');
const { promisify } = require('util');
const { asset } = require('./util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

module.exports.list = async () => Promise.all(
  (readdir(asset()))
    .map(async (i) => [i, (await stat(asset(i))).mtimeMs])
);
