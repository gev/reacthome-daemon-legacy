
const { get, set } = require('../../actions');
const { ACTION_SET_FAN_SPEED, ACTION_ON, ACTION_OFF, ACTION_SET_MODE, ACTION_SETPOINT } = require('../../constants');
const { writeRegister, readHoldingRegisters, writeRegisters, readCoils } = require('../modbus');
const { READ_HOLDING_REGISTERS, WRITE_REGISTER, READ_COILS, WRITE_REGISTERS } = require('../modbus/constants');
const { delay } = require('../../util');

const instance = new Map();

let deviceChannel;

const sync = async (id, modbus, address, n) => {
  for (let i = 0; i < n; i += 1) {
    const ch = `${id}/ac/${i + 1}`
    const { synced, value, mode, fan_speed, setpoint } = get(ch) || {};
    if (!synced) {
      let dataMode = 1;
      switch (mode) {
        case 0: {
          dataMode = 8;
          break;
        }
        case 1: {
          dataMode = 4;
          break;
        }
        case 2: {
          dataMode = 16;
          break;
        }
        case 3: {
          dataMode = 2;
          break;
        }
        case 4: {
          dataMode = 1;
          break;
        }
      }

      let dataFan = 0;
      switch (fan_speed) {
        case 0:
          dataFan = 8;
          break;
        case 1:
          dataFan = 4;
          break;
        case 2:
          dataFan = 2;
          break;
      }
      writeRegisters(modbus, address, 40078 + i * 91, [(value ? 1 : 0), dataMode, dataFan, 0, setpoint]);
      set(ch, { synced: true });
    } else {
      readHoldingRegisters(modbus, address, 40002 + i * 91, 7);
      deviceChannel = ch;
    }
    await delay(1000);
  }
};


const loop = (id) => async () => {
  const dev = get(id) || {};
  const { bind = "", numberAC } = dev;
  const [modbus, , address] = bind.split('/');
  await sync(id, modbus, address, numberAC);
  instance.set(id, setTimeout(loop(id), 100));
}


module.exports.run = (action) => {
  const { id, type, index } = action;
  const ch = `${id}/ac/${index}`;
  switch (type) {
    case ACTION_ON: {
      set(ch, { value: true, synced: false });
      break;
    }
    case ACTION_OFF: {
      set(ch, { value: false, synced: false });
      break;
    }
    case ACTION_SET_MODE: {
      set(ch, { mode: action.value, synced: false });
      break;
    }
    case ACTION_SET_FAN_SPEED: {
      set(ch, { fan_speed: action.value, synced: false });
      break;
    }
    case ACTION_SETPOINT: {
      set(ch, { setpoint: Math.max(16, Math.min(32, action.value)), synced: false });
      break;
    }
  }
};

module.exports.handle = (action) => {
  const { synced } = get(deviceChannel);
  const { id, data } = action;
  switch (data[0]) {
    case READ_HOLDING_REGISTERS: {
      offsetBuf = (val) => val * 2 + 2;

      const val = data.readUInt16BE(offsetBuf(0));
      const dataMode = data.readUInt16BE(offsetBuf(1));
      const speed = data.readUInt16BE(offsetBuf(2));
      const temp = data.readUInt16BE(offsetBuf(6));

      let fan_speed = 0;
      switch (speed) {
        case 8:
          fan_speed = 0;
          break;
        case 4:
          fan_speed = 1;
          break;
        case 2:
          fan_speed = 2;
          break;
      }

      let mode = 0;
      switch (dataMode) {
        case 8: {
          mode = 0;
          break;
        }
        case 4: {
          mode = 1;
          break;
        }
        case 16: {
          mode = 2;
          break;
        }
        case 2: {
          mode = 3;
          break;
        }
        case 1: {
          mode = 4;
          break;
        }
      }

      if (synced) {
        set(deviceChannel, {
          value: !!val,
          fan_speed,
          mode,
          setpoint: temp,
          synced: true,
        });
      }
      break;
    }
  }
}

// synced, value, mode, fan_speed, setpoint
module.exports.clear = () => {
  instance.clear();
}

module.exports.add = (id) => {
  if (instance.has(id)) {
    clearTimeout(instance.get(id))
  }
  instance.set(id, setTimeout(loop(id), 100));
};
