module.exports.handle = (rbus) => (data) => {
  console.log("UDP receive", data)
  // const x = data.slice(2, 8)
  // const mac = Array.from(x).map(i => i.toString(16)).join(':')
  // rbus.pool[mac] = { port: data[8], address: data[9] }
  // a = Array.from(data)
  // mac = a.slice(0, 6)
  rbus.port.send([
    0xa5,
    data.length,
    // ...mac,
    ...data
  ])
}
