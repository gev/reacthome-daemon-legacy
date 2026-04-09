const os = require('os');
const { crc16modbus } = require('crc');
const { ACTION_INITIALIZE, ACTION_DISCOVERY, ACTION_GET_INFO } = require('../../../constants');

const WAITING_PREAMBLE = 0
const WAITING_SIZE = 1
const WAITING_DATA = 2
const WAITING_MSB_CRC = 3
const WAITING_LSB_CRC = 4

const PREAMBLE = 0xa5

module.exports.handle = (rbus) => {

  let phase = WAITING_PREAMBLE
    , offset, size, crc
  let buff = Buffer.alloc(512)

  const handle = (buff) => {
    const action = buff[0];
    switch (action) {
      case ACTION_DISCOVERY: {
        rbus.mac = Buffer.copyBytesFrom(buff.slice(1, 7));
        rbus.socket.send(Buffer.from([0xf0, buff[7], buff[8], buff[9]]));
        const type = buff[8];
        if (!rbus.ready && type) {
          rbus.socket.send(Buffer.from([ACTION_INITIALIZE]));
          rbus.ready = true;
        }
        break;
      }
      case ACTION_GET_INFO: {
        rbus.socket.send(buff);
        const type = buff.readUInt16BE(1);
        if (!rbus.ready && type) {
          rbus.socket.send(Buffer.from([ACTION_INITIALIZE]));
          rbus.ready = true;
        }
        break;
      }
      default: {
        rbus.socket.send(buff);
      }
    }
  }

  const receivePreamble = (v) => {
    if (v === PREAMBLE) {
      offset = 0
      size = 0
      crc = 0
      buff[offset] = v
      offset++
      phase = WAITING_SIZE
    }
  }

  const receiveSize = (v) => {
    buff[offset] = v
    offset++
    size = v
    phase = v === 0 ? WAITING_MSB_CRC : WAITING_DATA
  }

  const receiveData = (v) => {
    buff[offset] = v
    offset++
    if (offset === size + 2) {
      phase = WAITING_MSB_CRC
    }
  }

  const receiveMsbCRC = (v) => {
    crc = v
    phase = WAITING_LSB_CRC
  }

  const receiveLsbCRC = (v) => {
    crc = (v << 8) | crc
    const buff_ = buff.slice(0, size + 2)
    const crc_ = crc16modbus(buff_)
    if (crc_ === crc) {
      handle(buff_.slice(2))
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
    for (let i = 0; i < data.length; i++) {
      process(data[i])
    }
  }
}
