const { macEqual } = require("./mac");

module.exports.registerAddress = (rbus, mac, type) => {
  let address = rbus.pool.findIndex(
    i => i && macEqual(i.mac, mac)
  );
  if (address === -1) {
    address = rbus.pool.length;
  }
  rbus.pool[address] = { mac, type };
  return address;
}

module.exports.getAddress = (rbus, mac) =>
  rbus.pool.findIndex(
    i => i && macEqual(i.mac, mac)
  );

module.exports.getDevice = (rbus, address) =>
  address >= 0
    ? rbus.pool[address]
    : undefined;

