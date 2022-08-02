const { macEqual } = require("./mac");

module.exports.getAddress = (rbus, mac, type) => {
  let address = rbus.pool.findIndex(
    i => i?.mac ?? macEqual(i.mac, mac)
  );
  if (address === -1) {
    address = rbus.pool.length + 1;
  }
  rbus.pool[address] = { mac, type };
  return address;
}
