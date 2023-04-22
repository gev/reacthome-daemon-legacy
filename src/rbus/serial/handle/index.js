module.exports.handle = (rbus) => (data) => {
  console.log("UART receive", data)
  rbus.socket.send(data.slice(1, data.length - 1))
}
