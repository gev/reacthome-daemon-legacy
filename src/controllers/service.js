
const fs = require('fs');
const { createSocket } = require('dgram');
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
  pendingFirmware,
  updateFirmware
} = require('../actions');
const { device } = require('../sockets');

const rawQue = {};

module.exports.manage = ({ dispatch, getState }) => {

  const socket = createSocket('udp4')
    .on('message', (data, { address }) => {
      try {
        const action = JSON.parse(data);
        switch (action.type) {
          case ACTION_GET: {
            Object.entries(getState()).forEach(([id, payload]) => {
              socket.send(JSON.stringify({ id, type: ACTION_SET, payload }), SERVICE_PORT, address);
              Object.values(payload).forEach(v => {
                if (!v || typeof v !== 'string') return;
                fs.exists(asset(v), (exists) => {
                  if (!exists) return;
                  socket.send(JSON.stringify({ type: ACTION_DOWNLOAD, name: v }), SERVICE_PORT, address);
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
                    socket.send(JSON.stringify({ type: ACTION_DOWNLOAD, name }), SERVICE_PORT, SERVICE_GROUP);
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
        }
      } catch (err) {
        console.error(err);
      }
    })
    .on('error', console.error)
    .bind(() => {
      const data = JSON.stringify({ id: mac, type: ACTION_DISCOVERY, payload: { type: DAEMON, version } });
      setInterval(() => {
        socket.send(data, SERVICE_PORT, SERVICE_GROUP);
      }, DISCOVERY_INTERVAL);
    });

}
