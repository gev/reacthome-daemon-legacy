
const fs = require('fs');
const dgram = require('dgram');
const { FILE, APPLICATION_PORT, APPLICATION_GROUP } = require('./constants');

const socket = dgram.createSocket('udp4');

const create = (type, id, payload) => ({ type, id, payload });

const send = (action) => {
  socket.send(JSON.stringify(action), APPLICATION_PORT, APPLICATION_GROUP);
};

const store = (state) => {
  fs.writeFile(FILE, JSON.stringify(state, null, 2), err => {
    if (err) console.error(err);
  });
};

module.exports = (type) => (id, payload) => (dispatch, getState) => {
  const action = create(type, id, payload);
  dispatch(action);
  store(getState());
  send(action);
};
