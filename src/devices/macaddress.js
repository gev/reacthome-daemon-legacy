
const crypto = require('crypto');
const { ACTION_MAC_ADDRESS, DEFAULT_MAC_ADDRESS } = require('../constants');

module.exports.ok = (id) => id !== DEFAULT_MAC_ADDRESS;

module.exports.create = (callback) => {
  crypto.randomBytes(7, (err, a) => {
    if (err) console.log(err);
    else {
      a[0] = ACTION_MAC_ADDRESS;
      a[1] &= 0b11111110;
      a[1] |= 0b00000010;
      callback(a);
    }
  })
};
