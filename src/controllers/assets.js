
const mount = require('koa-mount');
const static = require('koa-static');
const { ASSETS, ASSETS_ } = require('../constants');

module.exports.manage = () => mount(`/${ASSETS}`, static(`./${ASSETS_}/`));
