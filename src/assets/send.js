
const fs = require('fs');
const { asset, stat } = require('../fs');
const { sendAsset } = require('../webrtc/peer');

const highWaterMark = 16384;

module.exports = async (id, name) => {
  // const file = asset(name);
  // const s = await stat(file);
  // if (s.isFile()) {
  //   let i = 1;
  //   const transaction = Math.random() * 0xffff;
  //   const buff = Buffer.from(name);
  //   const m = s.size % highWaterMark;
  //   const total = m === 0 ? (s.size / highWaterMark) : (((s.size - m) / highWaterMark) + 1);
  //   const stream = fs.createReadStream(file, { highWaterMark });
  //   stream.on('readable', () => {
  //     const header = Buffer.alloc(2 + 2 + 2 + 2);
  //     header.writeUInt16LE(transaction, 0);
  //     header.writeUInt16LE(total, 2);
  //     header.writeUInt16LE(i, 4);
  //     header.writeUInt16LE(buff.length, 6);
  //     const chunk = stream.read(highWaterMark);
  //     if (chunk) {
  //       sendAsset(id, Buffer.concat([header, buff, chunk]));
  //       i += 1;
  //     }
  //   });
  //   stream.on('error', console.error);
  // }
};
