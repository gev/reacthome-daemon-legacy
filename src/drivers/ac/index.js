const ircodes = require('reacthome-ircodes');
const { get, set } = require('../../actions');
const { device } = require('../../sockets');
const { ACTION_IR, ON, OFF, ACTION_ON, ACTION_OFF, ACTION_ENABLE, ACTION_DISABLE, ACTION_RBUS_TRANSMIT, DEVICE_TYPE_IR_4 } = require('../../constants');

const manage = (power, setpoint, ac) => {
  if (!ac.bind) return;
  const [dev,,index] = ac.bind.split('/');
  const {ip, type, version = ''} = get(dev) || {};
  const model = (ircodes.codes.AC[ac.brand] || {})[ac.model] || {};
  const command = model.command(power, setpoint);
  switch (type) {
    case DEVICE_TYPE_IR_4: {
      const [major] = version.split('.');
      if (major < 2) return;
      const header = [];
      header[0] = ACTION_RBUS_TRANSMIT;
      dev.split(':').forEach((v, i)=> {
        header[i + 1] = parseInt(v, 16);
      });
      header[7] = ACTION_IR;
      header[8] = index;
      command.forEach((code, i) => {
        console.log(code);
        setTimeout(device.send, i * 500, Buffer.from(header.concat(code)), ip);
      })
      break;
    }
    default:
      command.forEach((code, i) => {
        const data = ircodes.encode(model.count, model.header, model.trail, code);
        const buff = Buffer.alloc(data.length * 2 + 5);
        buff.writeUInt8(ACTION_IR, 0);
        buff.writeUInt8(index, 1);
        buff.writeUInt8(0, 2);
        buff.writeUInt16BE(model.frequency, 3);
        for (let i = 0; i < data.length; i++) {
          buff.writeUInt16BE(data[i], i * 2 + 5);
        }
        setTimeout(device.send, i * 200, buff, ip);
      });
  }
};

module.exports.handle = ({ type, id }) => {
  const ac = get(id) || {};
  let enabled = ac.enabled;
  const { setpoint } = get(ac.thermostat) || {};
  const { value } = get(ac.bind) || {}
  switch (type) {
    case ACTION_ENABLE:
      enabled = true;
      set(ac.bind, { value: ON });
    case ACTION_ON: {
      if (!enabled) return;
      if (value === ON && ac.setpoint === setpoint) return;
      manage(ON, setpoint, ac);
      set(id, { setpoint, enabled });
      break;
    }
    case ACTION_DISABLE:
      enabled = false;
      set(ac.bind, { value: OFF });
    case ACTION_OFF: {
      if (value === OFF && ac.setpoint === setpoint) return;
      manage(OFF, setpoint, ac);
      set(id, { setpoint, enabled });
      break;
    }
  }
};
