
const fs = require('fs');
const { asset, stat } = require('../assets/util');
const { sendAsset } = require('../webrtc/peer');

const highWaterMark = 16384;

module.exports = async (id, name) => {
  const file = asset(name);
  const { isFile, size } = await stat(file);
  if (isFile()) {
    let i = 1;
    // eslint-disable-next-line no-undef
    const transaction = BigInt(Date.now());
    const buff = Buffer.from(name);
    const m = size % highWaterMark;
    const total = m === 0 ? (size / highWaterMark) : (((size - m) / highWaterMark) + 1);
    const stream = fs.createReadStream(file, { highWaterMark });
    stream.on('readable', () => {
      const header = Buffer.alloc(8 + 2 + 2 + 2);
      header.writeBigUInt64LE(transaction, 0);
      header.writeUInt16LE(total, 8);
      header.writeUInt16LE(i, 10);
      header.writeUInt16LE(buff.length, 12);
      const chunk = stream.read(highWaterMark);
      if (chunk) {
        sendAsset(id, Buffer.concat([header, buff, chunk]));
        i += 1;
      }
    });
    stream.on('error', console.error);
  }
};
