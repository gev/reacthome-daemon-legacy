module.exports.macS = (data) =>
  Array
    .from(data)
    .map(i => i.toString(16).padStart(2, '0'))
    .join(':');

module.exports.macA = (mac) =>
  mac
    .split(':')
    .map(i => parseInt(i, 16));

module.exports.macEqual = (m1, m2) =>
  m1[0] === m2[0] &&
  m1[1] === m2[1] &&
  m1[2] === m2[2] &&
  m1[3] === m2[3] &&
  m1[4] === m2[4] &&
  m1[5] === m2[5]
