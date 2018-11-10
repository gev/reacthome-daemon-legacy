
const { contains } = require('fast-deep-equal');
const { ACTION_SET, SERVICE_PORT, SERVICE_GROUP } = require('../constants');
const { service } = require('../sockets');
const state = require('../controllers/state');
const db = require('../db');

module.exports.get = state.get;

const apply = (id, payload) => {
  state.set(id, payload);
  service.broadcast(JSON.stringify(action));
  db.put(id, get(id), (err) => {
    if (err) console.log(err);
  });
};

module.exports.set = (id, payload) => {
  const prev = state.get(id);
  if (prev && contains(prev, payload)) return;
  apply(id, payload);
};

module.exports.add = (id, field, subject) => {
  const prev = state.get(id);
  if (prev && prev[field] && prev[field].includes(subject)) return;
  apply(id, {
    [field]: prev && prev[field] ? [...prev[field], subject] : [subject]
  });
};

module.exports.apply = (id, action) => {
  const o = state.get(id);
  if (!o) return;
  action(o);
};

const applySite = (id, action) => {
  const o = state.get(id);
  if (!o) return;
  action(o);
  if (!o.site || o.site.length === 0) return;
  o.site.forEach(i => applySite(i, action));
};

module.exports.applySite = applySite;
