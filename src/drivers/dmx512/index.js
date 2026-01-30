const { get, set } = require('../../actions');
const { ACTION_SET_ADDRESS, ACTION_SET_POSITION, DEVICE_TYPE_DI_4_RSM, DEVICE_TYPE_RS_HUB1_RS, ACTION_RS485_TRANSMIT, ACTION_UP, ACTION_DOWN, ACTION_STOP, ACTION_LIMIT_UP, ACTION_LIMIT_DOWN, ACTION_LEARN, ACTION_DELETE_ADDRESS, ACTION_OPEN, ACTION_CLOSE, ACTION_DMX512, DIM_FADE, DIM_OFF, DEVICE_TYPE_RS_HUB4, DEVICE_TYPE_SERVER, DMX512, DIM_SET, DIM_ON } = require('../../constants');
const { device } = require('../../sockets');
const { delay } = require('../../util');

const indexes = new Map();


module.exports.run = (action) => {
  const { id, index, type } = action;
  const { bind } = get(id) || {};
  if (!bind) return;
  const {value = 0, velocity = 180} = get(`${id}/${DMX512}/${index}`)|| {};
  const [dev_id, , dev_index] = bind.split("");
  const dev = get(dev_id) || {};
  switch (type) {
    case DIM_FADE: {
      const action = Buffer.alloc(7);
      buffer[0] = ACTION_DMX512;
      buffer[1] = dev_index;      
      buffer.writeUInt16BE(index, 2);
      buffer[4] = DIM_FADE;
      buffer[5] = value
      buffer[6] = velocity
      device.send(action, dev.ip);
      break;
    }
    case DIM_SET: {
      const action = Buffer.alloc(6);
      buffer[0] = ACTION_DMX512;
      buffer[1] = dev_index;      
      buffer.writeUInt16BE(index, 2);
      buffer[4] = DIM_SET;
      buffer[5] = value
      device.send(action, dev.ip);
      break
    }
    case DIM_ON: {
      const action = Buffer.alloc(5);
      buffer[0] = ACTION_DMX512;
      buffer[1] = dev_index;      
      buffer.writeUInt16BE(index, 2);
      buffer[4] = DIM_ON;
      device.send(action, dev.ip);
      break;
    }
    case DIM_OFF: {
      const action = Buffer.alloc(5);
      buffer[0] = ACTION_DMX512;
      buffer[1] = dev_index;      
      buffer.writeUInt16BE(index, 2);
      buffer[4] = DIM_OFF;
      device.send(action, dev.ip);
      break
    }
  }
}

module.exports.handle = ({ id, data }) => {
  console.log(id, data);
}


module.exports.clear = () => {

}

module.exports.add = (id) => {

};

send = (id, payload) => {
  // const { bind } = get(id);
  // if (!bind) return;
  // const { rs485_mode } = get(bind);
  // if (rs485_mode === DMX12_MODE) return;
  // const [dev, , index] = bind.split('/');
  // const { ip, type } = get(dev);
  // const header = Buffer.from([ACTION_DMX512, index, channel]);
  // const buffer = Buffer.concat([header, payload]);
  // device.send(buffer, ip);
};

query = (address, channel, a, b) => {
  const buffer = Buffer.alloc(7);
  buffer.writeUint8(0x9a, 0);
  buffer.writeUInt8(address, 1);
  buffer.writeInt16LE(1 << (channel - 1), 2);
  buffer.writeUInt8(a, 4);
  buffer.writeUInt8(b, 5);
  buffer.writeUInt8(buffer[1] ^ buffer[2] ^ buffer[4] ^ buffer[5], 6);
  return buffer;
}
