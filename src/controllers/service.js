
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
  DEVICE,
  SERVICE,
  SERVICE_PORT,
  SERVICE_GROUP,
  SERVICE_TYPE_DAEMON,
  DIM_FADE,
  DIM_TYPE
} = require('../constants');
const { set, offline, online, pendingFirmware, updateFirmware } = require('../actions');

const rawQue = {};

module.exports = ({ dispatch, getState }) => {

  const socket = createSocket('udp4')
    .on('message', (data, { address }) => {
      function send(action, addr = address) {
        socket.send(JSON.stringify(action), SERVICE_PORT, addr);
      };
      try {
        const action = JSON.parse(data);
        switch (action.type) {
          case ACTION_GET:
            Object.entries(getState()).forEach(([type, v]) => {
              Object.entries(v).forEach(([id, payload]) => {
                send({ id: mac, type: ACTION_SET, payload: { id, type, payload } });
              })
            });
            break;
          case ACTION_BOOTLOAD: {
            const device = getState()[action.id];
            dispatch(pendingFirmware(action.id, action.pendingFirmware));
            break;
          }  
          case ACTION_FIND_ME: {
            const device = getState()[action.id];
            socket.send(Buffer.from([ACTION_FIND_ME, action.finding]), DEVICE_PORT, device.ip);
            break;
          }
          case ACTION_DO: {
            const device = getState()[action.id];
            socket.send(Buffer.from([ACTION_DO, action.index, action.value]), DEVICE_PORT, device.ip);
            break;
          }
          case ACTION_DIMMER: {
            const device = getState()[action.id];
            switch (action.action) {
              case DIM_TYPE:
                socket.send(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value]), DEVICE_PORT, device.ip);
                break;
              case DIM_FADE:
                socket.send(Buffer.from([ACTION_DIMMER, action.index, action.action, action.value, action.velocity]), DEVICE_PORT, device.ip);
                break;
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
      const data = JSON.stringify({ id: mac, type: ACTION_DISCOVERY, payload: { type: SERVICE_TYPE_DAEMON, version } });
      setInterval(() => {
        socket.send(data, SERVICE_PORT, SERVICE_GROUP);
      }, DISCOVERY_INTERVAL);
    });

}
