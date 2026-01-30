const { get, set } = require('../../actions');
const { buffer_SET_ADDRESS, buffer_SET_POSITION, DEVICE_TYPE_DI_4_RSM, DEVICE_TYPE_RS_HUB1_RS, buffer_RS485_TRANSMIT, buffer_UP, buffer_DOWN, buffer_STOP, buffer_LIMIT_UP, buffer_LIMIT_DOWN, buffer_LEARN, buffer_DELETE_ADDRESS, buffer_OPEN, buffer_CLOSE, buffer_DMX512, DIM_FADE, DIM_OFF, DEVICE_TYPE_RS_HUB4, DEVICE_TYPE_SERVER, DMX512, DIM_SET, DIM_ON, ACTION_DMX512 } = require('../../constants');
const { device } = require('../../sockets');
const { delay } = require('../../util');


module.exports.run = (action) => {
  const { id, index, value = 0, velocity = 180 } = action;
  const { bind } = get(id) || {};
  console.log(get(id));
  if (!bind) return;
  const [dev_id, , dev_index_s] = bind.split("");
  const dev_index = parseInt(dev_index_s, 10);
  const dev = get(dev_id) || {};
  console.log(action);
  switch (action.action) {
    case DIM_FADE: {
      const buffer = Buffer.alloc(7);
      buffer[0] = ACTION_DMX512;
      buffer[1] = dev_index;      
      buffer.writeUInt16BE(index, 2);
      buffer[4] = DIM_FADE;
      buffer[5] = value
      buffer[6] = velocity
      device.send(buffer, dev.ip);
      console.log(buffer);
      break;
    }
    case DIM_SET: {
      const buffer = Buffer.alloc(6);
      buffer[0] = ACTION_DMX512;
      buffer[1] = dev_index;      
      buffer.writeUInt16BE(index, 2);
      buffer[4] = DIM_SET;
      buffer[5] = value
      device.send(buffer, dev.ip);
      console.log(buffer);
      break
    }
    case DIM_ON: {
      const buffer = Buffer.alloc(5);
      buffer[0] = ACTION_DMX512;
      buffer[1] = dev_index;      
      buffer.writeUInt16BE(index, 2);
      buffer[4] = DIM_ON;
      device.send(buffer, dev.ip);
      console.log(buffer);
      break;
    }
    case DIM_OFF: {
      const buffer = Buffer.alloc(5);
      buffer[0] = ACTION_DMX512;
      buffer[1] = dev_index;      
      buffer.writeUInt16BE(index, 2);
      buffer[4] = DIM_OFF;
      device.send(buffer, dev.ip);
      console.log(buffer);
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
  // const header = Buffer.from([buffer_DMX512, index, channel]);
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
