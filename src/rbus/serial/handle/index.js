module.exports.handle = (rbus) => (data) => {
  console.log("UART receive", data)
  const x = data.slice(2, 8)
  const mac = Array.from(x).map(i => i.toString(16)).join(':')
  rbus.pool[mac] = { port: data[8], address: data[9] }
  rbus.socket.send(Buffer.concat([x, data.slice(10)]))
}
