const { crc16modbus } = require('crc');

const WAITING_PREAMBLE = 0
const WAITING_SIZE = 1
const WAITING_DATA = 2
const WAITING_MSB_CRC = 3
const WAITING_LSB_CRC = 4

const PREAMBLE = 0xa5

module.exports.handle = (rbus) => {

  let phase = WAITING_PREAMBLE
    , offset, size, crc
  let buff = Buffer.alloc(255)

  const handleRBUS = (buff) => {
    const x = buff.slice(0, 6)
    const mac = Array.from(x).map(i => i.toString(16)).join(':')
    rbus.pool[mac] = { port: buff[6], address: buff[7] }
    rbus.socket.send(Buffer.concat([x, buff.slice(8)]))
  }

  const handleRS485 = (buff) => {
  }

  const receivePreamble = (v) => {
    if (v === PREAMBLE) {
      phase = WAITING_SIZE
      offset = 0
      size = 0
      crc = 0
    }
  }

  const receiveSize = (v) => {
    size = v;
    phase = WAITING_DATA
  }

  const receiveData = (v) => {
    buff[offset] = v;
    offset++
    if (offset === size) {
      phase = WAITING_MSB_CRC
    }
  }

  const receiveMsbCRC = (v) => {
    crc = v
    phase = WAITING_LSB_CRC
  }

  const receiveLsbCRC = (v) => {
    crc = (v << 8) | crc
    if (crc16modbus(buff) === crc) {
      handleRBUS(buff.slice(0, size))
    }
    phase = WAITING_PREAMBLE
  }

  const process = (v) => {
    switch (phase) {
      case WAITING_PREAMBLE:
        receivePreamble(v)
        break
      case WAITING_SIZE:
        receiveSize(v)
        break
      case WAITING_DATA:
        receiveData(v)
        break
      case WAITING_MSB_CRC:
        receiveMsbCRC(v)
        break
      case WAITING_LSB_CRC:
        receiveLsbCRC(v)
        break
    }
  }

  return (data) => {
    console.log("UART receive", data)
    for (let i = 0; i < data.length; i++) {
      process(data[i])
    }
  }
}
