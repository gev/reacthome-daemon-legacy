'use strict';

const SerialPort = require('serialport');
const crc = require('crc').crc16modbus;
const { set } = require('../../actions');

const address = 0x46;
const device = '/dev/ttyUSB0';
const delay = 200;
const period = 15000;

module.exports = class {

  constructor(id) {
    this.id = id;
    this.start();
  }

  start() {
    this.socket = new SerialPort(device, {
      baudRate: 9600,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
      autoOpen: true
    });
    this.socket
        .on('data', this.process)
        .on('error', console.error);
    this.request();
  }

  stop() {
    clearTimeout(this.t);
    this.socket.close();
  }

  login () {
    this.send([1, 1, 1, 1, 1, 1, 1, 1]);
  };

  request () {
    this.send([5, 0, 6]);
  };

  pool = [];
  process = data => {
    clearTimeout(this.t);
    this.pool.push(data);
    this.t = setTimeout(() => {
      const buff = Buffer.concat(this.pool);
      this.pool = [];
      if (buff.length === 4)
        if (buff.readUInt8(1) === 5)
          this.login();
        else
          this.request();
      else if (buff.length === 99) {
        const v = [];
        for (let i = 0; i < 6; i++) {
          v[i] = ((buff.readUInt16LE(i * 16 + 1) << 16) | buff.readUInt16LE(i * 16 + 3)) / 100;
        }
        set(this.id, { value: [v[0], v[1]], total: v[4] });
        this.t = setTimeout(this.request, period);
      }
    }, delay);
  };

  send(cmd) {
    this.socket.write(this.query(cmd), err => {
      if (err) console.error('error');
    });
  }

  query(cmd) {
    const buff = Buffer.alloc(1 + cmd.length);
    buff.writeUInt8(address & 0xff, 0);
    cmd.forEach((b, i) => {buff.writeUInt8(b, i + 1)});
    const req = Buffer.alloc(buff.length + 2, buff);
    req.writeUInt16LE(crc(buff), buff.length);
    return req;
  }

};
