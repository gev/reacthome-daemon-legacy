
const { get, set } = require('../../actions');
const { ACTION_ON, ACTION_OFF, ACTION_DALI, DALI_GROUP, DALI_LIGHT } = require('../../constants');
const { writeRegister } = require('../modbus/tcp');
const { READ_HOLDING_REGISTERS } = require('../modbus/constants');
const { delay } = require('../../util');

const instance = new Map();

const sync = async (id, kind, r, n) => {
  for (let i = 0; i < n; i += 1) {
    const ch = `${id}/${kind}/${i}`
    const { synced, value } = get(ch) || {};
    if (!synced) {
      writeRegister(id, r + i * 5, value > 254 ? 254 : value);
      set(ch, { synced: true });
      await (50);
    }
  }
}

const loop = (id) => async () => {
  await sync(id, DALI_GROUP, 2000, 16);
  await sync(id, DALI_LIGHT, 3000, 64);
  instance.set(id, setImmediate(loop(id)));
};

module.exports.handle = (a) => {
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
