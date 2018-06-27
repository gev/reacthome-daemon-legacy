
const fs = require('fs');
const fetch = require('node-fetch');
const crypto = require('crypto');
const {
  mac,
  version,
  asset,
  ACTION_DO,
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
  ACTION_SITE_LIGHT_OFF,
  ACTION_SETPOINT,
  ACTION_SCENE_RUN,
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
  DIM_TYPE
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
      device.send(Buffer.from([ACTION_DO, action.index, action.value]), dev.ip);
      break;
    }
    case ACTION_DIMMER: {
      const dev = getState()[action.id];
      switch (action.action) {
        case DIM_SET:
        case DIM_TYPE:
          device.send(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value]), dev.ip);
          break;
        case DIM_FADE:
          device.send(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value, action.velocity]), dev.ip);
          break;
        case DIM_ON:
        case DIM_OFF:  
          device.send(Buffer.from([ACTION_DIMMER, action.index, action.action]), dev.ip);
      }
      break;
    }
    case ACTION_LIGHT_ON: {
      const { id } = action;
      const { bind, last } = getState()[id];
      const { velocity } = getState()[bind];
      const [dev,,index] = bind.split('/');
      const { ip } = getState()[dev];
      device.send(Buffer.from([ACTION_DIMMER, index, DIM_FADE, last || 255, 150]), ip);
      break
    }
    case ACTION_LIGHT_OFF: {
      const { id } = action;
      const { bind } = getState()[id];
      const { velocity = 128 } = getState()[bind];
      const [dev,,index] = bind.split('/');
      const { ip } = getState()[dev];
      device.send(Buffer.from([ACTION_DIMMER, index, DIM_FADE, 0, 150]), ip);
      break;
    }
    case ACTION_LIGHT_SET: {
      const { id, value } = action;
      const { bind } = getState()[id];
      const { velocity = 128 } = getState()[bind];
      const [dev,,index] = bind.split('/');
      const { ip } = getState()[dev];
      device.send(Buffer.from([ACTION_DIMMER, index, DIM_FADE, value, 150]), ip);
      dispatch(set(id, { last: value }));
      break;
    }
    case ACTION_SITE_LIGHT_OFF: {
      const { id } = action;
      dispatch(applySite(id, ({ light_220 = [], light_LED = [] }) => (dispatch) => {
        light_220.map(i => dispatch(run({ type: ACTION_LIGHT_OFF, id: i})));
        light_LED.map(i => dispatch(run({ type: ACTION_LIGHT_OFF, id: i})));
      }));
    }
    case ACTION_SETPOINT: {
      const { id, value } = action;
      dispatch(set(id, { setpoint: value }));
      break;
    }
    case ACTION_SCENE_RUN: {
      const { id } = action;
      const scene = getState()[id];
      if (Array.isArray(scene.action)) {
        scene.action.forEach(i => {
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
