
const dgram = require('dgram');
const crypto = require('crypto');
const {
  DEVICE_PORT,
  DISCOVERY_INTERVAL,
  ACTION_DISCOVERY,
  ACTION_READY,
  ACTION_ERROR
} = require('../constants');
const { offline, online } = require('./status');
const macaddress = require('./macaddress');

const timeout = {};

module.exports = ({ dispatch, getState }, ip) => {

  Object.keys(getState().device || {}).forEach(id => {
    dispatch(offline(id));
  });
  
  const socket = dgram
    .createSocket('udp4')
    .on('message', (data, { address }) => {

      function send(buff) {
        socket.send(buff, DEVICE_PORT, address);
      };
      
      const id = Array.from(data.slice(0, 6)).map(i => `0${i.toString(16)}`.slice(-2)).join(':');
      const action = data[6];
      const type = data[7];

      if (!macaddress.ok(id)) send(macaddress.create(send));

      switch (action) {
        case ACTION_DISCOVERY:
          dispatch(online(id, type, address, false));
          break;
          case ACTION_READY:
          dispatch(online(id, type, address, true));
          break;
      }

    })
    .on('error', console.error)
    .bind(DEVICE_PORT, ip);
}