
const fs = require('fs');
const { asset, stat } = require('../assets/util');
const { sendAsset } = require('../webrtc/peer');

const highWaterMark = 16384;

let transaction = 0;

module.exports = async (id, name) => {
  const file = asset(name);
  const s = await stat(file);
  if (s.isFile()) {
    let i = 1;
    const buff = Buffer.from(name);
    const m = s.size % highWaterMark;
    const total = m === 0 ? (s.size / highWaterMark) : (((s.size - m) / highWaterMark) + 1);
    const stream = fs.createReadStream(file, { highWaterMark });
    stream.on('readable', () => {
      const header = Buffer.alloc(4 + 2 + 2 + 2);
      header.writeBigUInt64LE(transaction, 0);
      header.writeUInt16LE(total, 4);
      header.writeUInt16LE(i, 6);
      header.writeUInt16LE(buff.length, 8);
      const chunk = stream.read(highWaterMark);
      if (chunk) {
        sendAsset(id, Buffer.concat([header, buff, chunk]));
        i += 1;
      }
    });
    stream.on('error', console.error);
    transaction += 1;
  }
};
