
const fs = require('fs');
const { createSocket } = require('dgram');
const { contains } = require('fast-deep-equal');
const { FILE, ACTION_SET, SERVICE_PORT, SERVICE_GROUP } = require('../constants');

const socket = createSocket('udp4');

const send = (action) => {
  socket.send(JSON.stringify(action), SERVICE_PORT, SERVICE_GROUP);
};

const store = (state) => {
  fs.writeFile(FILE, JSON.stringify(state, null, 2), err => {
    if (err) console.error(err);
  });
};

const apply = (action) => (dispatch, getState) => {
  dispatch(action);
  store(getState());
  send(action);
};

module.exports.set = (id, payload) => (dispatch, getState) => {
  const prev = getState()[id];
  if (prev && contains(prev, payload)) return;
  dispatch(apply({
    type: ACTION_SET, id, payload
  }));
};

module.exports.add = (id, field, subject) => (dispatch, getState) => {
  const prev = getState()[id];
  if (prev && prev[field] && prev[field].includes(subject)) return;
  dispatch(apply({
    id,
    type: ACTION_SET,
    payload: {
      [field]: prev[field] ? [...prev[field], subject] : [subject]
    }
  }));
};
