
const { createSocket } = require('dgram');
const crypto = require('crypto');
const {
  mac,
  version,
  ACTION_DO,
  ACTION_DIMMER,
  ACTION_DISCOVERY,
  ACTION_FIND_ME,
  ACTION_BOOTLOAD,
  ACTION_GET,
  ACTION_SET,
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
          case ACTION_GET:
            Object.entries(getState()).forEach(([id, payload]) => {
              socket.send(JSON.stringify({ id, type: ACTION_SET, payload }), SERVICE_PORT, address);
            });
            break;
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
