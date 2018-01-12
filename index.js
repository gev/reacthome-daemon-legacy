
const os = require('os');
const dgram = require('dgram');
const { PORT } = require('./src/const');
const discovery = require('./src/discovery');

const DISCOVERY_INTERVAL = 3000;

const ip = Object
  .values(os.networkInterfaces())
  .reduce((a, iface) => {
    iface
      .filter(i => !i.internal && i.family === 'IPv4')
      .forEach(i => a.push(i)); 
    return a;
  }, [])[0].address;

const socket = dgram
  .createSocket('udp4')
  .on('message', (data, info) => {
    console.log(data, info)
  })
  .on('error', console.error)
  .bind(PORT, ip);

setInterval(discovery, DISCOVERY_INTERVAL, socket, ip);
