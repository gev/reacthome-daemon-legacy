
const { get, set } = require('../../actions');
const { device } = require('../../sockets');
const { ACTION_IR, ON, OFF, ACTION_ON, ACTION_OFF, ACTION_ENABLE, ACTION_DISABLE } = require('../../constants');

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

const manage = (power, mode = 0, fan = 0, setpoint = 24, bind) => {
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

module.exports.handle = ({ type, id }) => {
  const ac = get(id) || {};
  let enabled = ac.enabled;
  const { setpoint } = get(ac.thermostat) || {};
  const { value } = get(ac.bind) || {}
  switch (type) {
    case ACTION_ENABLE:
      enabled = true;
      set(bind, { value: enabled });
    case ACTION_ON: {
      if (!enabled) return;
      if (value === ON && ac.setpoint === setpoint) return;
      manage(ON, ac.mode, ac.fan, setpoint, ac.bind);
      set(id, { setpoint, enabled });
      break;
    }
    case ACTION_DISABLE:
      enabled = false;
      set(ac.bind, { value: enabled });
    case ACTION_OFF: {
      if (value === OFF && ac.setpoint === setpoint) return;
      manage(OFF, ac.mode, ac.fan, setpoint, ac.bind);
      set(id, { setpoint, enabled });
      break;
    }
  }
};
