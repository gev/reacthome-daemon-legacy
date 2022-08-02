module.exports.getAddress = (rbus, mac, type) => {
  let address = rbus.pool.findIndex(i => i.mac === mac);
  if (address === undefined) {
    address = rbus.pool.length + 1;
  }
  rbus.pool[address] = { mac, type };
  return address;
}