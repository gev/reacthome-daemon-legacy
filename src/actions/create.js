
const fs = require('fs');
const { createSocket } = require('dgram');
const { contains } = require('fast-deep-equal');
const { mac, FILE, ACTION_SET, SERVICE_PORT, SERVICE_GROUP } = require('../constants');

const socket = createSocket('udp4');

const send = (payload) => {
  socket.send(JSON.stringify({ id: mac, type: ACTION_SET, payload }), SERVICE_PORT, SERVICE_GROUP);
};

const store = (state) => {
  fs.writeFile(FILE, JSON.stringify(state, null, 2), err => {
    if (err) console.error(err);
  });
};

module.exports = (type, id, payload) => (dispatch, getState) => {
  const action = { type, id, payload };
  const prev = getState()[type][id]; 
  if (prev && contains(prev, payload)) return;
  dispatch(action);
  store(getState());
  send(action);
};
