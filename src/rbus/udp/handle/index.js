module.exports.handle = (rbus) => (data) => {
  rbus.port.send([
    0xa5,
    data.length,
    data
  ])
}
