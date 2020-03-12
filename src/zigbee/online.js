
const { set } = require('../actions');

const TIMEOUT = 300000;

const timers = new Map();

const offline = (id) => {
  set(id, { online: false });
}

const online = (id) => {
  clearInterval(timers.get(id));
  timers.set(id, setTimeout(offline, TIMEOUT, id));
  set(id, { online: true });
};

module.exports = { online, offline };
