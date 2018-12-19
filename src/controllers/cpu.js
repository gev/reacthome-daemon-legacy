
const { readFile } = require('fs');
const { set } = require('../actions');
const { mac, DISCOVERY_INTERVAL } = require('../constants');

module.exports.manage = () => {
  setInterval(() => {
    readFile('/sys/class/thermal/thermal_zone0/temp', (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      set(mac, { temperature: data / 1000 });
    });
  }, 10 * DISCOVERY_INTERVAL);
};
