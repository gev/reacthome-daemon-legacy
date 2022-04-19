const { existsSync, unlinkSync, readdirSync } = require("fs");
const { ASSETS } = require("./assets/constants");
const { PROJECT, DEVICE, IMAGE, SCRIPT, SITE, DAEMON } = require("./constants");
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
              // if (typeof d === 'string') {
                Object
                  .keys(pool)
                  .filter(i => i.startsWith(`${d}/`))
                  .forEach(i => {
                    state[i] = pool[i];
                  });
                state[d] = pool[d];
              // }
            });
            break;
          }
          default: {
            switch (subject.type) {
              case DAEMON:
              case PROJECT:
              case SITE:
              case SCRIPT: {
                v.forEach(i => { 
                  // if (typeof i === 'string') {
                    state[i] = pool[i];
                  // }
                });
                break;
              }
            }
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
  readdirSync(ASSETS).forEach(i => {
    if (!assets.includes(i)) {
      const a = asset(i);
      if (existsSync(a)) {
        unlinkSync(a);
      }
    }
  });
};

