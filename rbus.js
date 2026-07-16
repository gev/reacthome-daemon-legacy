const { rbus } = require("./src/rbus");

// Адреса вынесены в переменные окружения, чтобы один и тот же код работал
// в двух схемах развёртывания без правки исходников:
//  - обычная схема: rbus.js и daemon.js на одной машине, обмен через
//    loopback (значения по умолчанию — прежнее поведение, ничего менять
//    не нужно);
//  - выделенный RBUS-сервер: rbus.js на отдельной Raspberry, bind на адрес
//    физического интерфейса, кадры уходят демону на соседнюю машину
//    (адреса задаются окружением, например через PM2 ecosystem-файл).
const BIND_HOST = process.env.RBUS_BIND_HOST || "127.0.1.1";
const SERIAL_PATH = process.env.RBUS_SERIAL || "/dev/ttyAMA0";

setTimeout(() => {
  rbus(BIND_HOST, SERIAL_PATH);
}, 3_000);
