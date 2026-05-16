
const fetch = require('node-fetch');
const CronJob = require('cron').CronJob;
const { get, set } = require('../actions');
const { ACTION_SCRIPT_RUN } = require('../constants');
const { run } = require('./service');
const mac = require('../mac');

const key = 'fd688cedc9202c33d316dda05b28df8e';
// INC-031: AbortController-таймаут вместо OS-default 75-120с — закрывает socket принудительно
const FETCH_TIMEOUT_MS = 10000;

let sunrise;
let sunset;
let inFlight = false;  // INC-031: защита от параллельных pending fetch при ETIMEDOUT-серии

function weather(units = 'metric', lang = 'ru') {
  if (inFlight) return;  // не запускаем новый пока предыдущий висит

  const { project } = get(mac()) || {};
  if (!project) return;
  const { location } = get(project) || {};
  if (!location) return;
  const { lat, lng } = location;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  inFlight = true;

  fetch(`http://api.openweathermap.org/data/2.5/weather?APPID=${key}&units=${units}&lang=${lang}&lat=${lat}&lon=${lng}`, { signal: controller.signal })
    .then(res => res.json())
    .then(weather => {
      now = Date.now();
      weather.sys.sunrise *= 1000;
      if (sunrise) sunrise.stop();
      if (weather.sys.sunrise > now) {
        sunrise = new CronJob(new Date(weather.sys.sunrise), () => {
          const { project } = get(mac()) || {};
          const { onSunrise } = get(project) || {};
          if (onSunrise) run({ type: ACTION_SCRIPT_RUN, id: onSunrise });
        });
        sunrise.start();
      }

      weather.sys.sunset *= 1000;
      if (sunset) sunset.stop();
      if (weather.sys.sunset > now) {
        sunset = new CronJob(new Date(weather.sys.sunset), () => {
          const { project } = get(mac()) || {};
          const { onSunset } = get(project) || {};
          if (onSunset) run({ type: ACTION_SCRIPT_RUN, id: onSunset });
        });
        sunset.start();
      }

      set(project, { weather });
    })
    .catch((e) => {
      // INC-031: тихий warn вместо стека — снижает шум при ETIMEDOUT/ECONNRESET
      console.warn('[weather] fetch failed:', e.code || e.name, e.message);
    })
    .finally(() => {
      clearTimeout(timeoutId);
      inFlight = false;
    });
}

module.exports.manage = () => {
  setInterval(weather, 600000);
  weather();
}
