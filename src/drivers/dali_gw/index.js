
const { get, set } = require('../../actions');
const { DALI_GROUP, DALI_LIGHT } = require('../../constants');
const { writeRegister } = require('../modbus');

const instance = new Map();

const sync = async (id, kind, modbus, address, r, n) => {
  for (let i = 0; i < n; i += 1) {
    const ch = `${id}/${kind}/${i}`
    const { synced, value } = get(ch) || {};
    if (!synced) {
      writeRegister(modbus, address, r + i * 5, value > 254 ? 254 : value);
      set(ch, { synced: true });
      await (50);
    }
  }
}

const loop = (id) => async () => {
  const dev = get(id) || {};
  console.log(dev);
  const { bind } = dev;
  const [modbus, , address] = bind.split('/');
  await sync(id, DALI_GROUP, modbus, address, 2000, 16);
  await sync(id, DALI_LIGHT, modbus, address, 3000, 64);
  instance.set(id, setImmediate(loop(id)));
}

module.exports.run = (a) => {
  const { id, kind, index, value } = a;
  set(`${id}/${kind}/${index}`, { value, synced: false, dimmable: true })
}


module.exports.clear = () => {
  instance.forEach(i => clearImmediate(i))
  instance.clear();
}

module.exports.add = (id) => {
  if (instance.has(id)) {
    clearImmediate(instance.get(id))
  }
  instance.set(id, setImmediate(loop(id)));
};
