const dgram = require('dgram');
const os = require('os');
const { DEVICE_PORT, DEVICE_SERVER_PORT, ACTION_READY, ACTION_DISCOVERY, ACTION_INITIALIZE, DEVICE_TYPE_SERVER } = require('../../constants');
const { handle } = require('./handle');

// Куда пересылать кадры с шины. По умолчанию демон на той же машине
// (loopback); на выделенном RBUS-сервере адрес демона задаётся окружением.
const DAEMON_HOST = process.env.RBUS_DAEMON_HOST || '127.0.0.1';

// Готов ли адрес для bind. Loopback доступен с момента загрузки ядра, а вот
// адрес физического интерфейса появляется асинхронно (DHCP/dhcpcd) — процесс
// может стартовать раньше него, и немедленный bind упадёт с EADDRNOTAVAIL.
const addrReady = (host) =>
  host.startsWith('127.') ||
  Object.values(os.networkInterfaces()).flat().some((i) => i.address === host);

module.exports.createSocket = (rbus, host) => {
  const socket = dgram.createSocket('udp4');
  // Без обработчика 'error' любая ошибка сокета (в т.ч. EADDRNOTAVAIL при
  // раннем bind) — это необработанное событие: процесс падает целиком и
  // уходит в цикл перезапусков менеджера. Логируем и продолжаем жить.
  socket.on('error', (e) => console.error('[rbus] socket error:', e.code));
  socket.on('message', handle(rbus));
  // Биндимся только когда адрес реально появился на интерфейсе: иначе на
  // старте системы возможна гонка «rbus.js поднялся раньше сети», из-за
  // которой шина датчиков не работает до ручного перезапуска процесса.
  const bind = () => addrReady(host)
    ? socket.bind(DEVICE_PORT, host)
    : (console.log('[rbus] waiting for ' + host + ' on iface...'), setTimeout(bind, 1000));
  bind();
  const send = (data) => {
    if (rbus.mac) {
      socket.send(
        Buffer.concat([rbus.mac, data]),
        DEVICE_SERVER_PORT,
        DAEMON_HOST
      )
    }
  }
  rbus.socket = {
    host, send,
    close: socket.close
  }
  // setInterval(() => {
  //   // console.log(rbus);
  //   if (rbus.mac) {
  //     send(Buffer.from([
  //       // rbus.ready ? ACTION_READY : ACTION_DISCOVERY,
  //       ACTION_DISCOVERY,
  //       rbus.type || 0,
  //       rbus.version.major, rbus.version.minor // Version
  //     ]))
  //     if (!rbus.ready) {
  //       send(Buffer.from([ACTION_INITIALIZE]));
  //       rbus.ready = true;
  //     }
  //   }
  // }, 1_000)
}
