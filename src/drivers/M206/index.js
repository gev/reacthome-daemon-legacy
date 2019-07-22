'use strict';

const crc = require('crc').crc16modbus;
const { get, set } = require('../../actions');
const { device } = require('../../sockets');
const { ACTION_RS485_TRANSMIT } = require('../../constants');

const address = 0x46;
const delay = 500;
const period = 15000;

const pool = [0x27, 0x85, 0x63, 0x81];
const offset = 4;

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
    this.t = setInterval(this.request, period)
  }

  stop() {
    clearTimeout(this.t);
  }

  // handle (action) {
  //   console.log(action);
  // }

  request = () => {
    const cmd = pool.shift();
    this.send(cmd);
    setTimeout(this.request, delay);
    pool.push(cmd);
  };

  send = (cmd) => {
    const { bind } = get(id);
    if (!bind) return;
    const [dev,, index] = bind.split('/');
    const { ip } = get(dev);
    device.send(Buffer.from([ACTION_RS485_TRANSMIT, index, cmd]), ip);
  }

  query = (cmd) => {
    const buff = Buffer.alloc(1 + cmd.length);
    buff.writeUInt8(address & 0xff, 0);
    cmd.forEach((b, i) => {buff.writeUInt8(b, i + 1)});
    const req = Buffer.alloc(buff.length + 2, buff);
    req.writeUInt16LE(crc(buff), buff.length);
    return req;
  }

};
