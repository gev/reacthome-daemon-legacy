module.exports.handle = (rbus) => (data) => {
  console.log("UART receive", data)
  rbus.socket.send(data.slice(2, data.length - 2))
}
