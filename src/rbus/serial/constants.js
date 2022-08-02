module.exports.RBUS_BOUDRATE = 1_000_000;
module.exports.RBUS_LINE_CONTROLS = [
  { dataBits: 8, stopBits: 1, parity: 'none' },
  { dataBits: 8, stopBits: 1, parity: 'even' },
  { dataBits: 8, stopBits: 1, parity: 'odd' },
  { dataBits: 9, stopBits: 1, parity: 'none' },
  { dataBits: 8, stopBits: 2, parity: 'none' },
  { dataBits: 8, stopBits: 2, parity: 'even' },
  { dataBits: 8, stopBits: 2, parity: 'odd' },
  { dataBits: 9, stopBits: 2, parity: 'none' },
  null,
];
module.exports.RBUS_LINE_CONTROL = 0;
