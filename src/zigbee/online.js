
const { set } = require('../actions');

const TIMEOUT = 30000;

const timer = new Map();

const offline = (id) => {
  set(id, { online: false });
}

const online = (id) => {
  clearInterval(timer.get(ig));
  timer.set(id, setTimeout(offline, TIMEOUT, id));
  set(id, { offline: false });
};

module.exports = { online, offline };
