
const fetch = require('node-fetch');
const CronJob = require('cron').CronJob;
const { mac } = require('../constants');
const { get, set } = require('../actions');
const { run } = require('./service');

const key = 'fd688cedc9202c33d316dda05b28df8e';

let sunrise;
let sunset;

function weather(units = 'metric', lang = 'ru') {
  const { project } = get(mac) || {};
  if (!project) return;
  const { location } = get(project) || {};
  if (!location) return;
  const { lat, lng } = location;
  fetch(`http://api.openweathermap.org/data/2.5/weather?APPID=${key}&&units=${units}&lang=${lang}&lat=${lat}&lon=${lng}`)
    .then(res => res.json())
    .then(weather => {
      now = Date.now();
      weather.sys.sunrise *= 1000;
      if (sunrise) sunrise.stop();
      if (weather.sys.sunrise > now) sunrise = new CronJob(new Date(weather.sys.sunrise), () => {
        const { onSunrise } = get(project) || {};
        if (onSunrise) run({ type: ACTION_SCRIPT_RUN, script: onSunrise });
      });
      sunrise.start();

      weather.sys.sunset *= 1000;
      if (sunset) sunset.stop();
      if (weather.sys.sunset > now) sunset = new CronJob(new Date(weather.sys.sunset), () => {
        const { onSunset } = get(project) || {};
        if (onSunset) run({ type: ACTION_SCRIPT_RUN, script: onSunset });
      });
      sunset.start();

      set(project, { weather });
    })
    .catch(console.error);
}

module.exports.manage = () => {
  setInterval(weather, 600000);
  weather();
}