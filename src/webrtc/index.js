

const peer = require('./peer');
const start = require('./server');
const connect = require('./connect');
const signal = require('./signal');

module.exports = {
  ...peer,
  start(id) {
    connect(id, signal);
    start(signal);
  }
}
