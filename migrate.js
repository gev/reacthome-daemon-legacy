
const { readFileSync, writeFileSync} = require('fs');

const level = require('level');
const { DB } = require('./src/constants');
const {
  DO,
  DI,
  DIM,
  BUTTON,
  SMOCK_SENSOR,
  MOTION_SENSOR,
  LEAKAGE_SENSOR,
  VALVE_HEATING,
  VALVE_WATER,
  SOCKET_220,
  BOILER,
  PUMP,
  FAN,
} = require('./src/constants');

const db = level(DB, { valueEncoding: 'json' });
const file = './tmp/state.json';
const tmp = './tmp/state.tmp.json';

const state = {};

db.createReadStream()
  .on('data', ({ key, value }) => {
    state[key] = value;
  })
  .on('end', () => {
    // Object.entries(state).forEach(([k, v]) => {
    //   if (Array.isArray(v[FAN])) {
    //     v[FAN].forEach(i => {
    //       state[i].type = FAN;
    //       state[i].site = k;
    //       db.put(i, state[i]);
    //     })
    //   }
    // });
    const s = JSON.stringify(state, null, 2);
    writeFileSync(file, s);
    // writeFileSync(tmp, s);
  })
  .on('error', (err) => {
    console.error(err)
  });

// const state = JSON.parse(readFileSync(file));
// const stmp = JSON.parse(readFileSync(tmp));

// Object.entries(stmp).forEach(([k, v]) => {
//   if (v.code) state[k].code = v.code || state[k].code;
// });

// writeFileSync(file, JSON.stringify(state, null, 2));

// Object.entries(state).forEach(([k, v]) => {
//   console.log(k, v);
//   db.put(k, v, (e) => {
//     if (e) console.error(e);
//   })
// });

// db.close();

// const state = JSON.parse(readFileSync(file));
// let i = 0;
// Object
//   .entries(state)
//   .filter(i => i[0].split('/').length === 2)
//   .forEach(([k, v]) => {
//     const [id, index] = k.split('/');
//     const { type } = state[id];
//     const t = type === 0x0a ? DO : DI;
//     const uuid = `${id}/${t}/${index}`;
//     state[uuid] = state[k];
//     delete state[k];
//     console.log(++i, id, index, type.toString(16), t, uuid);
//   });

// const state = JSON.parse(readFileSync(file));
// let i = 0;
// Object
//   .entries(state)
//   .filter(([,{ bind = '' }]) => bind.split('/').length === 2)
//   .forEach(i => console.log(i));

  // writeFileSync(file, JSON.stringify(state, null, 2));
