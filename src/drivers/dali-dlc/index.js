
const { get, set } = require('../../actions');
const { DALI_GROUP, DALI_LIGHT } = require('../../constants');
const { writeRegisters, readWriteRegisters } = require('../modbus');
const { delay } = require('../../util');

const instance = new Map();

let tid = 0;

const sync = async (id, kind, modbus, address, port, n, mask) => {
  for (let i = 0; i < n; i += 1) {
    const ch = `${id}/${kind}/${port}.${i}`
    const { synced, value } = get(ch) || {};
    if (!synced) {
      writeRegisters(modbus, address, 41001, [(port << 8) | (mask | i), (2 << 8) | value, 0, 0]);
      set(ch, { synced: true });
    } else if (mask === 0) {
      readWriteRegisters(modbus, address, 32001, 4, 42001, [(tid << 8) | port, (i << 8) | 1]);
      tid += 1;
      tid %= 0xff;
    }
    await delay(20);
  }
}

const syncPort = async (id, port, modbus, address) => {
  const { numberGroups = 16, numberLights = 64 } = get(`${id}/port/${port}`) || {};
  await sync(id, DALI_GROUP, modbus, address, port, numberGroups, 0b1000_0000);
  await sync(id, DALI_LIGHT, modbus, address, port, numberLights, 0b0000_0000);
}

const loop = (id) => async () => {
  const dev = get(id) || {};
  const { bind } = dev;
  const [modbus, , address] = bind.split('/');
  await syncPort(id, 1, modbus, address);
  await syncPort(id, 2, modbus, address);
  instance.set(id, setTimeout(loop(id), 20));
}

module.exports.run = (a) => {
  const { id, kind, port, index, value } = a;
  set(`${id}/${kind}/${port}.${index}`, { value, synced: false, dimmable: true })
}

module.exports.handle = (data) => {
  console.log(data);
}


module.exports.clear = () => {
  instance.forEach(i => clearImmediate(i))
  instance.clear();
}

module.exports.add = (id) => {
  if (instance.has(id)) {
    clearTimeout(instance.get(id))
  }
  instance.set(id, setTimeout(loop(id), 20));
};
