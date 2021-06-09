const { contains } = require("fast-deep-equal");
const { ACTION_SET, CLIENT_PORT, CLIENT_GROUP } = require("../constants");
const { broadcast } = require("../websocket/peer");
const state = require("../controllers/state");
const db = require("../db");

module.exports.get = state.get;

const apply = (id, p) => {
  if (!id) return;
  const payload = { ...p, timestamp: Date.now() };
  state.set(id, payload);
  broadcast({ type: ACTION_SET, id, payload });
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

module.exports.add = (id, ref, value) => {
  const prev = state.get(id);
  if (prev && prev[ref] && prev[ref].includes(value)) return;
  apply(id, {
    [ref]: prev && prev[ref] ? [...prev[ref], value] : [value],
  });
  const v = state.get(value);
  if (v && v[prev.type || BIND]) {
    dispatch(modify(value, { [prev.type || BIND]: null }));
  }
};

module.exports.del = (id, ref, value) => {
  const prev = state.get(id);
  if (prev && prev[ref] && !prev[ref].includes(value)) return;
  apply(id, {
    [ref]: prev[ref].filter((i) => i !== value),
  });
};

module.exports.makeBind = (id, value, bind = BIND, ref) => {
  const back = ref || bind;
  const o = state.get(id);
  const v = state.get(value);
  if (o) apply(o[bind], { [bind]: null });
  if (v) apply(v[back], { [back]: null });
  apply(id, { [bind]: value });
  apply(value, { [back]: id });
};

module.exports.addBind = (id, ref, value, bind = BIND) => {
  const v = state.get(value);
  if (v) del(v[bind], ref, bind);
  add(id, ref, value);
  apply(value, { [bind]: id });
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
  o.site.forEach((i) => applySite(i, action));
};

module.exports.applySite = applySite;
