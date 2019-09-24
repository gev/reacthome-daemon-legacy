

const connect = require('./connect');
const start = require('../../server');
const signal = require('./signal')
const { run } = require('../controllers/service');

module.exports = (id) => {
  const handle = signal((message) => {
    try {
      console.log(message.toString());
      const action = JSON.parse(message);
      run(action);
    } catch(e) {
      console.error(e);
    }
  });
  connect(id, handle);
  start(handle);
}
