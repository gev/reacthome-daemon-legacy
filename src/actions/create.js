
const { contains } = require('fast-deep-equal');
const { ACTION_SET, CLIENT_PORT, CLIENT_GROUP } = require('../constants');
const { broadcastAction } = require('../webrtc/peer');
const state = require('../controllers/state');
const db = require('../db');

module.exports.get = state.get;

const apply = (id, p) => {
  if (!id) return;
  const payload = { ...p, timestamp: Date.now() };
  state.set(id, payload);
  broadcastAction({ type: ACTION_SET, id, payload });
  try {
    db.put(id, state.get(id), (err) => {
      if (err) console.error(err);
    });
  } catch (e) {
    console.error(e);
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

module.exports.del = (id, field, subject) => {
  const prev = state.get(id);
  if (prev && prev[field] && prev[field].includes(subject)) return;
  apply(id, {
    [field]: prev[field].filter(i => i !== subject)
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
