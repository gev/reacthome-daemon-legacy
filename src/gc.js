const { existsSync, unlinkSync } = require("fs");
const { PROJECT, DEVICE, IMAGE, SCRIPT, SITE } = require("./constants");
const db = require("./db");
const { asset } = require("./fs");

function isNumber(str) {
  return /^[0-9]+$/.test(str);
}

const build = (id, pool, state, assets) => {
  if (state[id]) return;
  const subject = pool[id];
  if (!subject) return;
  state[id] = subject;
  console.log(subject);
  Object.entries(subject).forEach(([k, v]) => {
    if (isNumber(k)) {
      delete subject[k];
      db.put(id, JSON.stringify(subject));
    } else if (v) {
      if (typeof v === 'string') {
        switch (k) {
          case PROJECT: {
            build(v, pool, state, assets);
            break;
          }
          case IMAGE: {
            if (!assets.includes(v)) {
              assets.push(v);
            }
          }
        }
      } else if (Array.isArray(v)) {
        switch (k) {
          case SITE:
          case SCRIPT: {
            v.forEach(i => {
              build(i, pool, state, assets);
            });
            break;
          }
          case DEVICE: {
            v.forEach(d => { 
              Object
                .keys(pool)
                .filter(i => i.startsWith(`${d}/`))
                .forEach(i => {
                  state[i] = pool[i];
                  console.log(state[i]);
                });
              state[d] = pool[d];
              console.log(state[d]);
            });
            break;
          }
        }
      }
    }
  });
};

module.exports.cleanup = (pool) => {
  const state = {};
  const assets = [];
  build(pool.mac, pool, state, assets);
  console.log('state', Object.keys(state).length);
  console.log('assets', Object.keys(assets).length);
  Object.keys(pool).forEach(k => { 
    if (k === 'mac') return;
    if (state[k] === undefined) { 
      delete pool[k];
      db.del(k);
    }
  });
  assets.forEach(i => { 
    const a = asset(i);
    if (existsSync(a)) {
      unlinkSync(a)
    }
  })
};

