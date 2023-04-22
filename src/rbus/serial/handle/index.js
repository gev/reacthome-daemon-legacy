module.exports.handle = (rbus) => (data) => {
  console.log("UART receive", data)
  const x = data.slice(2)
  const mac = Array.from(x.slice(0, 6)).map(i => i.toString(16)).join(':')
  const [port, address] = x.splice(6, 2)
  rbus.pool[mac] = { port, address }
  rbus.socket.send(x)
}
