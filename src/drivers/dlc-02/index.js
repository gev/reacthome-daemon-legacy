
const { get, set } = require('../../actions');
const { DALI_GROUP, DALI_LIGHT } = require('../../constants');
const { writeRegister, writeRegisters } = require('../modbus');
const { delay } = require('../../util');

const instance = new Map();

const sync = async (id, kind, modbus, address, port, n, mask) => {
  for (let i = 0; i < n; i += 1) {
    const ch = `${id}/${kind}/${i}`
    const { synced, value } = get(ch) || {};
    if (!synced) {
      const data = [(port << 8) | (mask | i), (1 << 8) | (value ? 1 : 0), 0, 0];
      console.log("set", i, data);
      writeRegisters(modbus, address, 41001, data);
      set(ch, { synced: true });
      await delay(50);
    }
  }
}

const loop = (id) => async () => {
  const dev = get(id) || {};
  const { bind, port } = dev;
  const [modbus, , address] = bind.split('/');
  await sync(id, DALI_GROUP, modbus, address, port, 16, 0b1000_0000);
  await sync(id, DALI_LIGHT, modbus, address, port, 64, 0b0000_0000);
  instance.set(id, setTimeout(loop(id), 50));
}

module.exports.run = (a) => {
  const { id, kind, index, value } = a;
  set(`${id}/${kind}/${index}`, { value, synced: false, dimmable: true })
}

module.exports.handle = (data) => {
  // console.log(data);
}


module.exports.clear = () => {
  instance.forEach(i => clearImmediate(i))
  instance.clear();
}

module.exports.add = (id) => {
  if (instance.has(id)) {
    clearTimeout(instance.get(id))
  }
  instance.set(id, setTimeout(loop(id), 50));
};
