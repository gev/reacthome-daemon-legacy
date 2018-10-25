
const mount = require('koa-mount');
const assets = require('koa-static');
const { ASSETS, ASSETS_DIR } = require('../constants');

module.exports.manage = () => mount(`/${ASSETS}`, assets(`./${ASSETS_DIR}/`));
