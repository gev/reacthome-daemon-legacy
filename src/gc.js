const { existsSync, unlinkSync, readdirSync } = require("fs");
const { ASSETS } = require("./assets/constants");
const { PROJECT, DEVICE, IMAGE, SCRIPT, SITE, DAEMON, POOL } = require("./constants");
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
  for (const [k, v] of Object.entries(subject)) {
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
            for (const i of v) {
              build(i, pool, state, assets);
            }
            break;
          }
          case DEVICE: {
            for (const d of v) {
              for (const i of d) {
                if (i.startsWith(`${d}/`)) {
                  state[i] = pool[i]
                }
              }
              state[d] = pool[d];
            }
            break;
          }
          default: {
            switch (subject.type) {
              case DAEMON:
              case PROJECT:
              case SITE:
              case SCRIPT: {
                for (const i of v) {
                  build(i, pool, state, assets);
                }
                break;
              }
            }
            break;
          }
        }
      }
    }
  }
};

const buildAll = (id, pool, state, assets) => {
  if (state[id]) return;
  const subject = pool[id];
  if (!subject) return;
  state[id] = subject;
  console.log(subject);
  for (const [k, v] of Object.entries(subject)) {
    if (!v) break;
    switch (k) {
      case IMAGE: {
        if (!assets.includes(v)) {
          assets.push(v);
          break;
        }
      }
      default: {
        if (Array.isArray(v)) {
          for (const i of v) {
            buildAll(i, pool, state, assets);
          }
        } else if (typeof v === 'string') {
          buildAll(v, pool, state, assets);
        }
      }
    }
  }
};

module.exports.cleanup = (pool) => {
  console.log("Before cleanup:", Object.keys(pool).length);
  const state = {};
  const assets = [];
  buildAll(pool.mac, pool, state, assets);
  for (const k of Object.keys(pool)) {
    if (k === 'mac') continue;
    if (k === POOL) continue;
    if (state[k] === undefined) {
      delete pool[k];
      db.del(k);
    }
  }
  for (const i of readdirSync(ASSETS)) {
    if (!assets.includes(i)) {
      const a = asset(i);
      if (existsSync(a)) {
        unlinkSync(a);
      }
    }
  }
  console.log("After cleanup:", Object.keys(pool).length);
};
