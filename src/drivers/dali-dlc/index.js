
const { get, set } = require('../../actions');
const { DALI_GROUP, DALI_LIGHT } = require('../../constants');
const { writeRegister, writeRegisters } = require('../modbus');
const { delay } = require('../../util');

const instance = new Map();

const sync = async (id, kind, modbus, address, port, n, mask) => {
  for (let i = 0; i < n; i += 1) {
    const ch = `${id}/${kind}/${port}.${i}`
    console.log(ch);
    const { synced, value } = get(ch) || {};
    if (!synced) {
      addr = (port << 8) | (mask | i)
      writeRegisters(modbus, address, 41001, [addr, (2 << 8) | value, 0, 0]);
      set(ch, { synced: true });
      await delay(20);
    } else {
      writeRegisters(modbus, address, 41001, [addr, (2 << 8) | value, 0, 0]);
    }
  }
}

syncPort = (id, port, modbus, address) => async () => {
  const { numberGroup = 16, numberLight = 64 } = get(`${id}/port/${port}`) || {};
  console.log(numberGroup, numberLight);
  await sync(id, DALI_GROUP, modbus, address, port, numberGroup, 0b1000_0000);
  await sync(id, DALI_LIGHT, modbus, address, port, numberLight, 0b0000_0000);
}

const loop = (id) => async () => {
  const dev = get(id) || {};
  const { bind } = dev;
  const [modbus, , address] = bind.split('/');
  console.log(dev, bind);
  await syncPort(id, 1, modbus, address);
  await syncPort(id, 2, modbus, address);
  instance.set(id, setTimeout(loop(id), 20));
}

module.exports.run = (a) => {
  console.log(a)
  const { id, kind, port, index, value } = a;
  set(`${id}/${kind}/${port}.${index}`, { value, synced: false, dimmable: true })
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
  instance.set(id, setTimeout(loop(id), 20));
};
