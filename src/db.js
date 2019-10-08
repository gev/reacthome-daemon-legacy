
const level = require('level');
const { DB } = require('./assets/constants');

module.exports = level(DB, { valueEncoding: 'json' });
