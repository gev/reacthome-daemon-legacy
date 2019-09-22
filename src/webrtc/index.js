

const connect = require('./connect');
const start = require('../../server');
const signal = require('./signal')
const { run } = require('../controllers/service');

module.exports = (id) => {
  const handle = signal(run);
  connect(id, handle);
  start(handle);
}
