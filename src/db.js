
const level = require('level');

const DB = './var/db';

module.exports = level(DB, { valueEncoding: 'json' });
