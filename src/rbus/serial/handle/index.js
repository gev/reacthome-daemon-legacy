module.exports.handle = (rbus) => (data) => {
  rbus.socket.send(data.slice(1, data.length - 1))
}
