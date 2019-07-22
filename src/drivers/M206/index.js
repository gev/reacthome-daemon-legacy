'use strict';

const crc = require('crc').crc16modbus;
const { get, set } = require('../../actions');
const { device } = require('../../sockets');
const { ACTION_RS485_TRANSMIT } = require('../../constants');

const address = 0x46;
const delay = 500;
const period = 15000;

const cmd = [0x27, 0x85, 0x63, 0x81];

const number = x =>
    x instanceof Array
        ? x.reduce((a, b) => 100 * a + number(b), 0)
        : 10 * (x >> 4 & 0xf) + (x & 0xf);

module.exports = class {

  constructor(id) {
    this.id = id;
    this.start();
  }

  start() {
    this.t = setInterval(this.request, period);
  }

  stop() {
    clearTimeout(this.t);
  }

  // handle (action) {
  //   console.log(action);
  // }

  request = () => {
    cmd.forEach((c, i) => {
      setTimeout(this.send, i * delay, c);
    });
  };

  send = (cmd) => {
    const { bind } = get(this.id);
    if (!bind) return;
    const [dev,, index] = bind.split('/');
    const { ip } = get(dev);
    const buff = Buffer.alloc(5, 0);
    buff.writeUInt32BE(address, 0);
    buff.writeUInt8(cmd, 4)
    const req = Buffer.alloc(7, buff);
    req.writeUInt16LE(crc(buff), 5);
    device.send(req, ip);
    console.log(req);
  }

};
