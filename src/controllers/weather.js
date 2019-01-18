
const fetch = require('node-fetch');
const { mac } = require('../constants');
const { get, set } = require('../actions');

const key = 'fd688cedc9202c33d316dda05b28df8e';

function weather(units = 'metric', lang = 'ru') {
  const { project } = get(mac) || {};
  if (!project) return;
  const { location } = get(project) || {};
  if (!location) return;
  const { lat, lng } = location;
  fetch(`http://api.openweathermap.org/data/2.5/weather?APPID=${key}&&units=${units}&lang=${lang}&lat=${lat}&lon=${lng}`)
    .then(res => res.json())
    .then(weather => {
      set(project, { weather });
    })
    .catch(console.error);
}

module.exports.manage = () => {
  setInterval(weather, 600000);
  weather();
}