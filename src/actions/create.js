
const { contains } = require('fast-deep-equal');
const { ACTION_SET, SERVICE_PORT, SERVICE_GROUP } = require('../constants');
const { service } = require('../sockets');
const db = require('../db');

const apply = (id, payload) => (dispatch, getState) => {
  const action = { id, payload, type: ACTION_SET };
  dispatch(action);
  service.broadcast(JSON.stringify(action));
  db.put(id, getState()[id], (err) => {
    if (err) console.log(err);
  });
};

module.exports.set = (id, payload) => (dispatch, getState) => {
  const prev = getState()[id];
  if (prev && contains(prev, payload)) return;
  dispatch(apply(id, payload));
};

module.exports.add = (id, field, subject) => (dispatch, getState) => {
  const prev = getState()[id];
  if (prev && prev[field] && prev[field].includes(subject)) return;
  dispatch(apply(id, {
    [field]: prev && prev[field] ? [...prev[field], subject] : [subject]
  }));
};

module.exports.apply = (id, action) => (dispatch, getState) => {
  const o = getState()[id];
  if (!o) return;
  dispatch(action(o));
};

const applySite = (id, action) => (dispatch, getState) => {
  const o = getState()[id];
  if (!o) return;
  dispatch(action(o));
  if (!o.site || o.site.length === 0) return;
  o.site.forEach(i => dispatch(applySite(i, action)));
};

module.exports.applySite = applySite;
