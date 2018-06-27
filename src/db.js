
const level = require('level');
const { DB } = require('./constants');

module.exports = level(DB, { valueEncoding: 'json' });
