
const { exists, createWriteStream } = require('fs');
const fetch = require('node-fetch');
const crypto = require('crypto');
const ircodes = require('reacthome-ircodes');
const {
  mac,
  VERSION,
  asset,
  TV,
  DO,
  DIM,
  ACTION_DO,
  ACTION_DOPPLER,
  ACTION_DIMMER,
  ACTION_DISCOVERY,
  ACTION_FIND_ME,
  ACTION_BOOTLOAD,
  ACTION_INIT,
  ACTION_SET,
  ACTION_DOWNLOAD,
  ACTION_RGB,
  ACTION_IR,
  ACTION_RGB_SET,
  ACTION_LIGHT_ON,
  ACTION_LIGHT_OFF,
  ACTION_LIGHT_SET,
  ACTION_LIGHT_SET_RELATIVE,
  ACTION_SITE_LIGHT_SET_RELATIVE,
  ACTION_SITE_LIGHT_OFF,
  ACTION_SETPOINT,
  ACTION_TIMER_START,
  ACTION_TIMER_STOP,
  ACTION_DOPPLER_HANDLE,
  ACTION_TOGGLE,
  ACTION_TV,
  ACTION_SCRIPT_RUN,
  DEVICE_PORT,
  DISCOVERY_INTERVAL,
  DAEMON,
  MOBILE,
  DEVICE,
  SERVICE,
  CLIENT_PORT,
  CLIENT_GROUP,
  DIM_ON,
  DIM_OFF,
  DIM_SET,
  DIM_FADE,
  DIM_TYPE,
  DIM_TYPE_RELAY,
  ACTION_PNP,
  PNP_ENABLE,
  PNP_STEP,
  OPERATOR_PLUS,
  OPERATOR_MINUS,
  OPERATOR_MUL,
  OPERATOR_DIV,
  STATE,
  ASSETS
} = require('../constants');
const {
  get,
  set,
  add,
  offline,
  online,
  applySite,
  pendingFirmware,
  updateFirmware
} = require('../actions');
const { device, service } = require('../sockets');

const timer = {};

const VELOCITY = 128;

const download = (ip, name) => {
  const file = asset(name);
  exists(file, (ex) => {
    if (ex) return;
    fetch(`http://${ip}:${CLIENT_PORT}/${ASSETS}/${name}`)
      .then(res => {
        if (res.status !== 200) return;
        const ws = createWriteStream(file);
        ws.on('end', () => {
          service.broadcast(JSON.stringify({ id: mac, type: ACTION_DOWNLOAD, name: name }));
        });
        res.body.pipe(ws);
      })
      .catch(console.error);
  });
};

const init = (ip) => {
  fetch(`http://${ip}:${CLIENT_PORT}/${STATE}/${mac}`)
    .then(response => response.json())
    .then(({ assets = [], state = {} }) => {
      assets.forEach((name) => {
        download(ip, name);
      });
      Object.entries(state).forEach(([k, v]) => {
        if (k === mac) {
          v.online = true;
          v.type = DAEMON;
          v.version = VERSION;
        }
        set(k, v);
      });
    })
    .catch(console.error);
};

const run = (action, address) => {
  try {
    switch (action.type) {
      case ACTION_INIT: {
        init(address);
        break;
      }
      case ACTION_SET: {
        const { id, payload } = action;
        set(id, payload);
        break;
      }
      case ACTION_DISCOVERY: {
        const { id, payload } = action;
        const { multicast, type, version: VERSION } = payload;
        if (multicast) {
          service.delUnicast(address);
        } else {
          service.addUnicast(address);
        }
        if (id && type !== MOBILE) {
          set(id, { online: true, ip: address, multicast, VERSION });
          add(mac, DEVICE, id);
          clearTimeout(timer[id]);
          timer[id] = setTimeout(() => {
            set(id, { online: false });
          }, 60 * DISCOVERY_INTERVAL);
        }
        break;
      }
      case ACTION_BOOTLOAD: {
        pendingFirmware(action.id, action.pendingFirmware);
        break;
      }  
        case ACTION_FIND_ME: {
        const dev = get(action.id);
        device.send(Buffer.from([ACTION_FIND_ME, action.finding]), dev.ip);
        break;
      }
      case ACTION_DO: {
        const dev = get(action.id);
        const id = `${action.id}/${DO}/${action.index}`
        device.send(Buffer.from([ACTION_DO, action.index, action.value]), dev.ip);
        // device.sendConfirm(Buffer.from([ACTION_DO, action.index, action.value]), dev.ip, () => {
        //   const channel = get(id);
        //   return channel && channel.value === action.value;
        // }, 300);
        break;
      }
      case ACTION_DOPPLER: {
        const dev = get(action.id);  
        device.send(Buffer.from([ACTION_DOPPLER, action.gain]), dev.ip);
        // device.sendConfirm(Buffer.from([ACTION_DOPPLER, action.gain]), dev.ip, () => {
        //   const dev = get(action.id);
        //   return dev && dev.gain === action.gain;
        // }, 300);
        break;
      }
      case ACTION_DIMMER: {
        const dev = get(action.id);
        const id = `${action.id}/${DIM}/${action.index}`;
        switch (action.action) {
          case DIM_SET:
            device.send(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value]));
            // device.sendConfirm(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value]), dev.ip, () => {
            //   const channel = get(id);
            //   return channel && channel.value === action.value;
            // }, 300);
            break;
          case DIM_TYPE:
            device.send(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value]), dev.ip);
            // device.sendConfirm(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value]), dev.ip, () => {
            //   const channel = get(id);
            //   return channel && channel.type === action.value;
            // }, 300);
            break;
          case DIM_FADE:
            device.send(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value, action.velocity]), dev.ip);
            // device.sendConfirm(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value, action.velocity]), dev.ip, () => {
            //   const channel = get(id);
            //   return channel && channel.value === action.value;
            // }, 300);
            break;
          case DIM_ON:
            device.send(Buffer.from([ACTION_DIMMER, action.index, action.action]), dev.ip);
            // device.sendConfirm(Buffer.from([ACTION_DIMMER, action.index, action.action]), dev.ip, () => {
            //   const channel = get(id);
            //   return channel && channel.value === 255;
            // }, 300);
            break;
        case DIM_OFF:   
          device.send(Buffer.from([ACTION_DIMMER, action.index, action.action]), dev.ip);
            // device.sendConfirm(Buffer.from([ACTION_DIMMER, action.index, action.action]), dev.ip, () => {
            //   const channel = get(`${action.id}/${DIM}/${action.index}`);
            //   return channel && channel.value === 0;
            // }, 300);
            break;
        }
        break;
      }
      case ACTION_PNP: {
        const dev = get(action.id);
        set(action.id, { t0: Date.now() });
        switch (action.action) {
          case PNP_ENABLE:
            device.send(Buffer.from([ACTION_PNP, PNP_ENABLE, action.enabled]), dev.ip);
            break;
          case PNP_STEP:
            const buff = Buffer.alloc(5);
            buff.writeUInt8(ACTION_PNP, 0);
            buff.writeUInt8(PNP_STEP, 1);
            buff.writeUInt8(action.direction, 2);
            buff.writeUInt16BE(action.step, 3);
            device.send(buff, dev.ip);
            break;
        }
        break;
      }
      case ACTION_RGB_SET: {
        const { id, value } = action;
        const { ip } = get(id);  
        device.send(Buffer.from([ACTION_RGB, 0, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff ]), ip);
        set(id, { rgb: value });
        break;
      }
      case ACTION_LIGHT_ON: {
        const { id } = action;
        const { bind, last } = get(id);
        const { velocity, type } = get(bind);
        const [dev,,index] = bind.split('/');
        const { ip } = get(dev);
        const value = last || 255
        switch (type) {
          case DIM_TYPE_RELAY:
            device.send(Buffer.from([ACTION_DIMMER, index, DIM_ON]), ip);
            break;
          default:
            device.send(Buffer.from([ACTION_DIMMER, index, DIM_FADE, value, VELOCITY]), ip);
        }
        // device.sendConfirm(Buffer.from([ACTION_DIMMER, index, DIM_FADE, value, 150]), ip, () => {
        //   const light = get(id);
        //   return light && light.value === value;
        // }, 300);
        break;
      }
      case ACTION_LIGHT_OFF: {
        const { id } = action;
        const { bind } = get(id);
        const { velocity = 128, type } = get(bind);
        const [dev,,index] = bind.split('/');
        const { ip } = get(dev);
        switch (type) {
          case DIM_TYPE_RELAY:
            device.send(Buffer.from([ACTION_DIMMER, index, DIM_OFF]), ip);
            break;
          default:
            device.send(Buffer.from([ACTION_DIMMER, index, DIM_FADE, 0, VELOCITY]), ip);
        }
        // device.sendConfirm(Buffer.from([ACTION_DIMMER, index, DIM_FADE, 0, 150]), ip, () => {
        //   const light = get(id);
        //   return light && light.value === 0;
        // }, 300);
        break;
      }
      case ACTION_LIGHT_SET: {
        const { id, value } = action;
        const { bind } = get(id);
        const { velocity = 128 } = get(bind);
        const [dev,,index] = bind.split('/');
        const { ip } = get(dev);
        device.send(Buffer.from([ACTION_DIMMER, index, DIM_FADE, value, VELOCITY]), ip);
        // device.sendConfirm(Buffer.from([ACTION_DIMMER, index, DIM_FADE, value, 150]), ip, () => {
        //   const light = get(id);
        //   return light && light.value === value;
        // }, 300);
        set(id, { last: value });
        break;
      }
      case ACTION_LIGHT_SET_RELATIVE: {
        const { id, operator } = action;
        const { value, code } = get(id);
        let v;
        switch (operator) {
          case OPERATOR_PLUS:
            v = value + Number(action.value);
            break;
          case OPERATOR_MINUS:
            v = value - Number(action.value);
            break;
            case OPERATOR_MUL:
            v = value * Number(action.value);
            break;
            case OPERATOR_DIV:
            v = value / Number(action.value);
            break;
        }
        if (v < 0) v = 0;
        if (v > 255) v = 255;
        if (v === value) return;
        run({ type: ACTION_LIGHT_SET, id, value: v });
        break;
      }
      case ACTION_SITE_LIGHT_SET_RELATIVE: {
        const { id, operator, value } = action;
        applySite(id, ({ light_220 = [], light_LED = [] }) => {
          light_220.map(i => run({ type: ACTION_LIGHT_SET_RELATIVE, id: i, operator, value }));
          light_LED.map(i => run({ type: ACTION_LIGHT_SET_RELATIVE, id: i, operator, value }));
        });
        break;
      }
      case ACTION_SITE_LIGHT_OFF: {
        const { id } = action;
        applySite(id, ({ light_220 = [], light_LED = [] }) => {
          light_220.map(i => run({ type: ACTION_LIGHT_OFF, id: i }));
          light_LED.map(i => run({ type: ACTION_LIGHT_OFF, id: i }));
        });
        break;
      }
      case ACTION_SETPOINT: {
        const { id, value } = action;
        set(id, { setpoint: value });
        break;
      }
      case ACTION_TIMER_START: {
        const { id, script, time } = action;
        clearTimeout(timer[id]);
        timer[id] = setTimeout(() => {
          set(id, { time: 0, state: false });
          run({ type: ACTION_SCRIPT_RUN, id: script });
        }, parseInt(time));
        set(id, { time, script, state: true, timestamp: Date.now() });
        break;
      }
      case ACTION_TIMER_STOP: {
        const { id } = action;
        clearTimeout(timer[id]);
        set(id, { tame: 0, state: false });
        break;
      }
      case ACTION_DOPPLER_HANDLE: {
        const { id, low, high, onQuiet, onLowThreshold, onHighThreshold } = action;
        const { value, active } = get(id);
        if (value >= high) {
          set(id, { active: true });
          if (onHighThreshold) {
            run({ type: ACTION_SCRIPT_RUN, id: onHighThreshold });
          }
          if (onLowThreshold) {
            run({ type: ACTION_SCRIPT_RUN, id: onLowThreshold });
          }
        } else if (value >= low) {
          set(id, { active: true });
          if (onLowThreshold) {
            run({ type: ACTION_SCRIPT_RUN, id: onLowThreshold });
          }
        } else if (active) {
          set(id, { active: false });
          if (onQuiet) {
            run({ type: ACTION_SCRIPT_RUN, id: onQuiet });
          }
        }
        break;
      }
      case ACTION_TOGGLE: {
        const { test = [], onOn, onOff } = action;
        const f = test.reduce((a, b) => a || (get(b) || {}).value, false);
        if (f) {
          if (onOff) {
            run({ type: ACTION_SCRIPT_RUN, id: onOff });
          }
        } else {
          if (onOn) {
            run({ type: ACTION_SCRIPT_RUN, id: onOn });
          }
        }
        break;
      }
      case ACTION_TV: {
        const { id, command, repeat } = action;
        const { bind, brand, model } = get(id);
        const [dev,,index] = bind.split('/');
        const { ip } = get(dev);
        ircodes.getCode(TV, brand, model, command)
          .then(({ frequency, offset, data }) => {
            if (!data) return;
            let length = offset > 1 ? offset : data.length;
            let start = 0;
            if (repeat) {
              start = offset - 1;
              length = data.length - offset + 1;
            }
            const buff = Buffer.alloc(length * 2 + 5);
            buff.writeUInt8(ACTION_IR, 0);
            buff.writeUInt8(index, 1);
            buff.writeUInt8(0, 2);
            buff.writeUInt16BE(frequency, 3);
            for (let i = 0; i < length; i++) {
              buff.writeUInt16BE(data[i + start], i * 2 + 5);
            }
            device.send(buff, ip);
          })
          .catch(console.error);
      }
      case ACTION_SCRIPT_RUN: {
        const { id } = action;
        const script = get(id);
        if (script && Array.isArray(script.action)) {
          script.action.forEach(i => {
            const { type, payload } = get(i);
            run({ type, ...payload });
          })
        }
        break;
      }
    }
  } catch(e) {
    console.error(e);
  }
};

module.exports.manage = () => {
    service.handle((data, { address }) => {
      try {
        run(JSON.parse(data), address);
      } catch (err) {
        console.error(err);
      }
    });
}

module.exports.run = run;
