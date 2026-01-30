const { get, set } = require('../../actions');
const { ACTION_SET_ADDRESS, ACTION_SET_POSITION, DEVICE_TYPE_DI_4_RSM, DEVICE_TYPE_RS_HUB1_RS, ACTION_RS485_TRANSMIT, ACTION_UP, ACTION_DOWN, ACTION_STOP, ACTION_LIMIT_UP, ACTION_LIMIT_DOWN, ACTION_LEARN, ACTION_DELETE_ADDRESS, ACTION_OPEN, ACTION_CLOSE, ACTION_DMX512 } = require('../../constants');
const { device } = require('../../sockets');
const { delay } = require('../../util');

const indexes = new Map();


module.exports.run = (action) => {
  const { id, index, type } = action;
  console.log(action);
  switch (type) {

  }

}

module.exports.handle = ({ id, data }) => {
  const ch = indexes.get(id);
  switch (data[0]) {
    case 0xd8: {
      if (ch) {
        const { address, channel } = get(ch) || {};
        const k = 1 << (channel - 1);
        if (address == data[1] && k == data[2]) {
          set(ch, { value: data[7] });
        }
      }
      break;
    }
  }
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
