
const fs = require('fs');
const fetch = require('node-fetch');
const crypto = require('crypto');
const {
  mac,
  version,
  asset,
  DO,
  DIM,
  ACTION_DO,
  ACTION_DOPPLER,
  ACTION_DIMMER,
  ACTION_DISCOVERY,
  ACTION_FIND_ME,
  ACTION_BOOTLOAD,
  ACTION_GET,
  ACTION_SET,
  ACTION_DOWNLOAD,
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
  ACTION_SCRIPT_RUN,
  DEVICE_PORT,
  DISCOVERY_INTERVAL,
  DAEMON,
  DEVICE,
  SERVICE,
  SERVICE_PORT,
  SERVICE_GROUP,
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
  OPERATOR_DIV
} = require('../constants');
const {
  set,
  offline,
  online,
  applySite,
  pendingFirmware,
  updateFirmware
} = require('../actions');
const { device, service } = require('../sockets');

const timer = {};

const run = (action, address) => (dispatch, getState) => {
  switch (action.type) {
    case ACTION_GET: {
      Object.entries(getState()).forEach(([id, payload]) => {
        service.send(JSON.stringify({ id, type: ACTION_SET, payload }), address);
        Object.values(payload).forEach(v => {
          if (!v || typeof v !== 'string') return;
          fs.exists(asset(v), (exists) => {
            if (!exists) return;
            service.send(JSON.stringify({ type: ACTION_DOWNLOAD, name: v }), address);
          });
        });
      }); 
      break;
    }
    case ACTION_SET: {
      const { id, payload } = action;
      dispatch(set(id, payload));
      break;
    }
    case ACTION_DOWNLOAD: {
      const { name } = action;
      const file = asset(name);
      fs.exists(file, (exists) => {
        if (exists) return;
        fetch(`http://${address}:${SERVICE_PORT}/${name}`)
          .then(res => {
            if (res.status !== 200) return;
            const ws = fs.createWriteStream(file);
            ws.on('error', console.error);
            ws.on('finish', () => {
              service.send(JSON.stringify({ type: ACTION_DOWNLOAD, name }), SERVICE_GROUP);
            });
            res.body.pipe(ws);
          })
          .catch(console.err);
      });
      break;
    }
    case ACTION_BOOTLOAD: {
      dispatch(pendingFirmware(action.id, action.pendingFirmware));
      break;
    }  
      case ACTION_FIND_ME: {
      const dev = getState()[action.id];
      device.send(Buffer.from([ACTION_FIND_ME, action.finding]), dev.ip);
      break;
    }
    case ACTION_DO: {
      const dev = getState()[action.id];
      const id = `${action.id}/${DO}/${action.index}`
      device.send(Buffer.from([ACTION_DO, action.index, action.value]), dev.ip);
      // device.sendConfirm(Buffer.from([ACTION_DO, action.index, action.value]), dev.ip, () => {
      //   const channel = getState()[id];
      //   return channel && channel.value === action.value;
      // }, 300);
      break;
    }
    case ACTION_DOPPLER: {
      const dev = getState()[action.id];  
      device.send(Buffer.from([ACTION_DOPPLER, action.gain]), dev.ip);
      // device.sendConfirm(Buffer.from([ACTION_DOPPLER, action.gain]), dev.ip, () => {
      //   const dev = getState()[action.id];
      //   return dev && dev.gain === action.gain;
      // }, 300);
      break;
    }
    case ACTION_DIMMER: {
      const dev = getState()[action.id];
      const id = `${action.id}/${DIM}/${action.index}`;
      switch (action.action) {
        case DIM_SET:
          device.send(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value]));
          // device.sendConfirm(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value]), dev.ip, () => {
          //   const channel = getState()[id];
          //   return channel && channel.value === action.value;
          // }, 300);
          break;
        case DIM_TYPE:
          device.send(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value]), dev.ip);
          // device.sendConfirm(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value]), dev.ip, () => {
          //   const channel = getState()[id];
          //   return channel && channel.type === action.value;
          // }, 300);
          break;
        case DIM_FADE:
          device.send(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value, action.velocity]), dev.ip);
          // device.sendConfirm(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value, action.velocity]), dev.ip, () => {
          //   const channel = getState()[id];
          //   return channel && channel.value === action.value;
          // }, 300);
          break;
        case DIM_ON:
          device.send(Buffer.from([ACTION_DIMMER, action.index, action.action]), dev.ip);
          // device.sendConfirm(Buffer.from([ACTION_DIMMER, action.index, action.action]), dev.ip, () => {
          //   const channel = getState()[id];
          //   return channel && channel.value === 255;
          // }, 300);
          break;
      case DIM_OFF:   
        device.send(Buffer.from([ACTION_DIMMER, action.index, action.action]), dev.ip);
          // device.sendConfirm(Buffer.from([ACTION_DIMMER, action.index, action.action]), dev.ip, () => {
          //   const channel = getState()[`${action.id}/${DIM}/${action.index}`];
          //   return channel && channel.value === 0;
          // }, 300);
          break;
      }
      break;
    }
    case ACTION_PNP: {
      const dev = getState()[action.id];
      dispatch(set(action.id, { t0: Date.now() }));
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
    case ACTION_LIGHT_ON: {
      const { id } = action;
      const { bind, last } = getState()[id];
      const { velocity, type } = getState()[bind];
      const [dev,,index] = bind.split('/');
      const { ip } = getState()[dev];
      const value = last || 255
      switch (type) {
        case DIM_TYPE_RELAY:
          device.send(Buffer.from([ACTION_DIMMER, index, DIM_ON]), ip);
          break;
        default:
          device.send(Buffer.from([ACTION_DIMMER, index, DIM_FADE, value, 200]), ip);
      }
      // device.sendConfirm(Buffer.from([ACTION_DIMMER, index, DIM_FADE, value, 150]), ip, () => {
      //   const light = getState()[id];
      //   return light && light.value === value;
      // }, 300);
      break;
    }
    case ACTION_LIGHT_OFF: {
      const { id } = action;
      const { bind } = getState()[id];
      const { velocity = 128, type } = getState()[bind];
      const [dev,,index] = bind.split('/');
      const { ip } = getState()[dev];
      switch (type) {
        case DIM_TYPE_RELAY:
          device.send(Buffer.from([ACTION_DIMMER, index, DIM_OFF]), ip);
          break;
        default:
          device.send(Buffer.from([ACTION_DIMMER, index, DIM_FADE, 0, 200]), ip);
      }
      // device.sendConfirm(Buffer.from([ACTION_DIMMER, index, DIM_FADE, 0, 150]), ip, () => {
      //   const light = getState()[id];
      //   return light && light.value === 0;
      // }, 300);
      break;
    }
    case ACTION_LIGHT_SET: {
      const { id, value } = action;
      const { bind } = getState()[id];
      const { velocity = 128 } = getState()[bind];
      const [dev,,index] = bind.split('/');
      const { ip } = getState()[dev];
      device.send(Buffer.from([ACTION_DIMMER, index, DIM_FADE, value, 200]), ip);
      // device.sendConfirm(Buffer.from([ACTION_DIMMER, index, DIM_FADE, value, 150]), ip, () => {
      //   const light = getState()[id];
      //   return light && light.value === value;
      // }, 300);
      dispatch(set(id, { last: value }));
      break;
    }
    case ACTION_LIGHT_SET_RELATIVE: {
      const { id, operator } = action;
      const { value, code } = getState()[id];
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
      dispatch(run({ type: ACTION_LIGHT_SET, id, value: v }));
      break;
    }
    case ACTION_SITE_LIGHT_SET_RELATIVE: {
      const { id, operator, value } = action;
      dispatch(applySite(id, ({ light_220 = [], light_LED = [] }) => (dispatch) => {
        light_220.map(i => dispatch(run({ type: ACTION_LIGHT_SET_RELATIVE, id: i, operator, value })));
        light_LED.map(i => dispatch(run({ type: ACTION_LIGHT_SET_RELATIVE, id: i, operator, value })));
      }));
      break;
    }
    case ACTION_SITE_LIGHT_OFF: {
      const { id } = action;
      dispatch(applySite(id, ({ light_220 = [], light_LED = [] }) => (dispatch) => {
        light_220.map(i => dispatch(run({ type: ACTION_LIGHT_OFF, id: i })));
        light_LED.map(i => dispatch(run({ type: ACTION_LIGHT_OFF, id: i })));
      }));
      break;
    }
    case ACTION_SETPOINT: {
      const { id, value } = action;
      dispatch(set(id, { setpoint: value }));
      break;
    }
    case ACTION_TIMER_START: {
      const { id, script, time } = action;
      clearTimeout(timer[id]);
      timer[id] = setTimeout(() => {
        dispatch(run({ type: ACTION_SCRIPT_RUN, id: script }));
        dispatch(set(id, { state: false }));
      }, time);
      dispatch(set(id, { time, script, state: true, timestamp: Date.now() }));
      break;
    }
    case ACTION_TIMER_STOP: {
      const { id } = action;
      clearTimeout(timer[id]);
      dispatch(set(id, { state: false }));
      break;
    }
    case ACTION_DOPPLER_HANDLE: {
      const { id, low, high, onQuiet, onLowThreshold, onHighThreshold } = action;
      const { value } = getState()[id];
      dispatch(set(id, { active: true }));
      if (value >= high) {
        if (onHighThreshold) {
          dispatch(run({ type: ACTION_SCRIPT_RUN, id: onHighThreshold }));
        }
        if (onLowThreshold) {
          dispatch(run({ type: ACTION_SCRIPT_RUN, id: onLowThreshold }));
        }
      } else if (value >= low) {
        dispatch(set(id, { active: true }));
        if (onLowThreshold) {
          dispatch(run({ type: ACTION_SCRIPT_RUN, id: onLowThreshold }));
        }
      } else {
        if (onQuiet) {
          const { active } = getState()[id];
          if (active) {
            dispatch(set(id, { active: false }))
            dispatch(run({ type: ACTION_SCRIPT_RUN, id: onQuiet }));
          }
        }
      }
      break;
    }
    case ACTION_TOGGLE: {
      const { test = [], onOn, onOff } = action;
      const f = test.reduce((a, b) => a || (getState()[b] || {}).value, false);
      if (f) {
        if (onOff) {
          dispatch(run({ type: ACTION_SCRIPT_RUN, id: onOff }));
        }
      } else {
        if (onOn) {
          dispatch(run({ type: ACTION_SCRIPT_RUN, id: onOn }));
        }
      }
      break;
    }
    case ACTION_SCRIPT_RUN: {
      const { id } = action;
      const script = getState()[id];
      if (script && Array.isArray(script.action)) {
        script.action.forEach(i => {
          const { type, payload } = getState()[i];
          dispatch(run({ type, ...payload }));
        })
      }
      break;
    }
  }
};

module.exports.manage = ({ dispatch, getState }) => {
    service.handle((data, { address }) => {
      try {
        dispatch(run(JSON.parse(data), address));
      } catch (err) {
        console.error(err);
      }
    });
}

module.exports.run = run;
