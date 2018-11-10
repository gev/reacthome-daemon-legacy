
const mount = require('koa-mount');
const { readdir } = require('fs');
const { promisify } = require('util');
const { STATE, ASSETS_DIR } = require('../constants');

let state = {};
const ls = promisify(readdir);

module.exports.init = (s) => state = s;

module.exports.get = (id) => state[id];

module.exports.set = (id, payload) => {
  if (state[id]) {
    Object.assign(state[id], payload)
  } else {
    state[id] = payload;
  }
};

module.exports.manage = () => mount(`/${STATE}`, async (ctx, next) => {
  await next();
  try {
    const assets = await ls(ASSETS_DIR);
    ctx.body = JSON.stringify({ assets, state });
  } catch (e) {
    ctx.body = JSON.stringify({ assets: [], state });
  }
});
