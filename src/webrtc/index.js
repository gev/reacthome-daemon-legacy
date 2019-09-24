

const connect = require('./connect');
const start = require('../../server');
const signal = require('./signal')

module.exports = (id) => {
  connect(id, signal);
  start(signal);
}
