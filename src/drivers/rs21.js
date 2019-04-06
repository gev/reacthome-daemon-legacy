
const fetch = require('node-fetch');
const { get, set } = require('../actions');

module.exports = class {

  constructor(id) {
    this.id = id;
    this.start();
  }

  start() {
    this.timer = setInterval(() => {
      const { ip } = get(id);
      fetch(`http://${ip}/sensors`)
        .then(resp => resp.text)
        .then(temperature => set(id, { temperature }))
        .catch(console.error);
    }, 10000);
  }

  stop() {
    clearInterval(this.timer);
  }

}