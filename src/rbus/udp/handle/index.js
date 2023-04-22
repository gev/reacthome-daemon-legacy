module.exports.handle = (rbus) => (data) => {
  console.log("UDP receive", data)
  rbus.port.send([
    0xa5,
    data.length,
    ...Array.from(data)
  ])
}
