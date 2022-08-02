const { rbus } = require(".");
const { macEqual } = require("./mac");

module.exports.getAddress = (rbus, mac, type) => {
  let address = rbus.pool.findIndex(
    i => i && macEqual(i.mac, mac)
  );
  if (address === -1) {
    address = rbus.pool.length;
  }
  rbus.pool[address] = { mac, type };
  return address + 1;
}

module.exports.getDevice = (rbus, address) =>
  rbus.pool[address - 1];

