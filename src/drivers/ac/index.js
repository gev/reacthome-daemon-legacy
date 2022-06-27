const ircodes = require("reacthome-ircodes");
const { get, set } = require("../../actions");
const { device } = require("../../sockets");
const {
  ACTION_IR,
  ON,
  OFF,
  ACTION_ON,
  ACTION_OFF,
  ACTION_ENABLE,
  ACTION_DISABLE,
  ACTION_RBUS_TRANSMIT,
  DEVICE_TYPE_IR_4,
  DEVICE_TYPE_IR6,
  DEVICE_TYPE_IR1,
  ACTION_DO,
} = require("../../constants");
const { run } = require("../../controllers/service");

const manage = (power, setpoint, ac) => {
  if (!ac.bind) return;
  const [dev, , index] = ac.bind.split("/");
  const { ip, type, version = "" } = get(dev) || {};
  const model = (ircodes.codes.AC[ac.brand] || {})[ac.model];
  const command = model.command(power, setpoint);
  switch (type) {
    case DEVICE_TYPE_IR_4: {
      if (!model) return;
      const [major] = version.split(".");
      if (major < 2) return;
      const header = [];
      header[0] = ACTION_RBUS_TRANSMIT;
      dev.split(":").forEach((v, i) => {
        header[i + 1] = parseInt(v, 16);
      });
      header[7] = ACTION_IR;
      header[8] = index;
      command.forEach((code, i) => {
        setTimeout(
          device.send,
          i * model.delay,
          Buffer.from([...header, ...code]),
          ip
        );
      });
      break;
    }
    case DEVICE_TYPE_IR1:
    case DEVICE_TYPE_IR6: {
      if (!model) return;
      command.forEach((code, i) => {
        const data = ircodes.encode(
          model.count,
          model.header,
          model.trail,
          code
        );
        const buff = Buffer.alloc(data.length * 2 + 5);
        buff.writeUInt8(ACTION_IR, 0);
        buff.writeUInt8(index, 1);
        buff.writeUInt8(0, 2);
        buff.writeUInt16BE(model.frequency, 3);
        for (let i = 0; i < data.length; i++) {
          buff.writeUInt16BE(data[i], i * 2 + 5);
        }
        setTimeout(device.send, i * model.delay, buff, ip);
      });
      break;
    }
    default: {
      run({ id: dev, index, type: ACTION_DO, value: power })
      break;
    }

  }
};

module.exports.handle = ({ type, id }) => {
  const ac = get(id) || {};
  // let enabled = ac.enabled;
  const { setpoint } = get(ac.thermostat) || {};
  switch (type) {
    case ACTION_ENABLE:
      // enabled = true;
      manage(ON, setpoint, ac);
      set(id, { value: ON, setpoint, enabled: true });
      set(ac.bind, { value: ON });
      break;
    case ACTION_ON: {
      if (ac.value === ON && ac.setpoint == setpoint) return;
      manage(ON, setpoint, ac);
      set(id, { value: ON, setpoint, enabled: true });
      break;
    }
    case ACTION_DISABLE:
      manage(OFF, setpoint, ac);
      set(id, { value: OFF, setpoint, enabled: false });
      set(ac.bind, { value: OFF });
      break;
    case ACTION_OFF: {
      if (ac.value === OFF) return;
      manage(OFF, setpoint, ac);
      set(id, { value: OFF, setpoint, enabled: false });
      break;
    }
  }
};
