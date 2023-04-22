module.exports.handle = (rbus) => (data) => {
  console.log("UDP receive", data)
  a = Array.from(data)
  mac = a.slice(0, 6)
  rbus.port.send([
    0xa5,
    data.length - 2,
    ...mac,
    ...data.slice(8)
  ])
}
