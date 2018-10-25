
const mount = require('koa-mount');
const { readdir } = require('fs');
const { promisify } = require('util');
const { STATE, ASSETS_DIR } = require('../constants');

const ls = promisify(readdir);

module.exports.manage = ({ getState }) => mount(`/${STATE}`, async (ctx, next) => {
  await next();
  try {
    const assets = await ls(ASSETS_DIR);
    const state = getState();
    ctx.body = JSON.stringify({ assets, state });
  } catch (e) {
    ctx.body = JSON.stringify({ assets: [], state });
  }
});
