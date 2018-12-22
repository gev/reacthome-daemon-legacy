
const { contains } = require('fast-deep-equal');
const { ACTION_SET, CLIENT_PORT, CLIENT_GROUP } = require('../constants');
const { service } = require('../sockets');
const state = require('../controllers/state');
const db = require('../db');

module.exports.get = state.get;

const apply = (id, payload) => {
  state.set(id, payload);
  service.broadcast(JSON.stringify({ type: ACTION_SET, id, payload }));
  try {
    db.put(id, state.get(id), (err) => {
      if (err) console.log(err);
    });
  } catch (e) {
    console.log(e);
  }
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

const count_on = (site, type) => {
  const { count = {}, parent } = get(site);
  const n = count[type];
  set(site, { count: { ...count, [type]: (Number.isInteger(n) && n) < 0 ? 0 : n + 1 } });
  if (parent) count_on(parent, type);
};

module.exports.count_on = count_on;

const count_off = (site, type) => {
  const { count = {}, parent } = get(site);
  const n = count[type];
  set(site, { count: { ...count, [type]: (Number.isInteger(n) && n) > 0 ? n - 1 : 0 } });
  if (parent) count_off(parent, type);
};

module.exports.count_off = count_off;

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
