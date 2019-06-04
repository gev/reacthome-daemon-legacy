
const { get, set } = require('../../actions');
const { device } = require('../../sockets');
const { ACTION_IR, ON, OFF } = require('../../constants');

const code = (a, b, data) => {
  const code = [a, b];
  data.forEach((x, i) => {
    for (let m = 0b10000000; m > 0; m >>= 1) {
      if (x & m) {
        code.push(20, 60);
      } else {
        code.push(20, 20);
      }
    }
  });
  return code;
}

const frequency = 38000;

const handle = (power, mode = 0, fan = 0, setpoint = 24, bind) => {
  if (!bind) return;
  const [dev,,index] = bind.split('/');
  const { ip } = get(dev) || {};
  if (!ip) return;
  const buff = Buffer.alloc(597);
  buff.writeUInt8(ACTION_IR, 0);
  buff.writeUInt8(index, 1);
  buff.writeUInt8(0, 2);
  buff.writeUInt16BE(frequency, 3);
  const data = [0xf2, 0x0d, 0x03, 0xfc, 0x01];
  let t = setpoint < 17 ? 0 : (setpoint - 17);
  data[5] = (t & 0xf) << 4;
  data[6] = ((fan ? ((fan + 1) & 0x7) : 0 ) << 5) | (power ? (mode & 0x3) : 0x7);
  data[7] = 0;
  data[8] = data.reduce((a, b) => a ^ b);
  const ir = code(167, 164, data);
  ir.push(20, 282);
  for (let i = 0; i < ir.length; i++) {
    buff.writeUInt16BE(ir[i], i * 2 + 5);
    buff.writeUInt16BE(ir[i], (i + ir.length) * 2 + 5);
  }
  device.send(buff, ip);
};

module.exports.on = id => {
  const { mode, fan, thermostat, bind } = get(id) || {};
  const { setpoint } = get(thermostat) || {};
  const ch = get(bind) || {};
  if (ch.value === ON && ch.setpoint === setpoint) return;
  handle(ON, mode, fan, setpoint, bind);
  set(bind, { value: ON, setpoint });
};

module.exports.off = id => {
  const { mode, fan, thermostat, bind } = get(id) || {};
  const { setpoint } = get(thermostat) || {};
  const ch = get(bind) || {};
  if (ch.value === ON && ch.setpoint === setpoint) return;
  handle(OFF, mode, fan, setpoint, bind);
  set(bind, { value: OFF, setpoint });
};
