module.exports.macS = (data) =>
  Array
    .from(data)
    .map(i => i.toString(16).padStart(2, '0'))
    .join(':');

module.exports.macA = (mac) =>
  mac
    .split(':')
    .map(i => parseInt(i, 16));
