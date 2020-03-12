
const { set } = require('../actions');

const TIMEOUT = 300000;

const timers = new Map();

const offline = (id) => {
  set(id, { online: false });
}

const online = (id, address) => {
  clearInterval(timers.get(id));
  timers.set(id, setTimeout(offline, TIMEOUT, id));
  set(id, { online: true, address });
};

module.exports = { online, offline };
