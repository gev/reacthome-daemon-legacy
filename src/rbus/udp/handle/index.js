const { ACTION_RBUS_TRANSMIT } = require("../../../constants");

module.exports.handle = (rbus) => (data) => {
  // console.log("UDP receive", data)
  if (data[0] === ACTION_RBUS_TRANSMIT) {
    const x = data.slice(0, 7)
    mac = Array.from(x.slice(1)).map(i => i.toString(16)).join(':')
    entry = rbus.pool[mac]
    if (entry) {
      const { port, address } = entry
      rbus.port.send([0xa5, data.length + 2, ...x, port, address, ...data.slice(7)])
    }
  } else {
    rbus.port.send([0xa5, data.length, ...data])
  }
}
