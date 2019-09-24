

const connect = require('./connect');
const start = require('../../server');
const signal = require('./signal')
const { run } = require('../controllers/service');

module.exports = (id) => {
  const handle = signal((message) => {
    try {
      console.log(message);
      const action = JSON.parse(message.toString());
      run(action);
    } catch(e) {
      console.error(e);
    }
  });
  connect(id, handle);
  start(handle);
}
