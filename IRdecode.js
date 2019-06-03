
const { createSocket } = require('dgram');
const { ACTION_IR, DEVICE_PORT, DEVICE_GROUP } = require('./src/constants');

const index = 5;
const threshold = 40;
const frequency = 38000;
const ip = '192.168.18.130';
const device = createSocket('udp4');

const b = [
  [340,169,20,20,20,20,20,64,20,20,20,20,20,20,20,20,20,20,20,64,20,64,20,20,20,64,20,64,20,64,20,64,20,64,20,64,20,20,20,20,20,20,20,64,20,20,20,20,20,20,20,20,20,64,20,64,20,64,20,20,20,64,20,64,20,64,20],//1545],//,340],//,86,20,3664]
  // [367,174,22,20,20,21,20,66,21,21,21,19,21,21,21,21,20,21,20,67,21,66,21,20,21,66,20,67,20,67,20,67,20,67,20,67,21,20,21,19,21,21,21,66,20,21,20,21,20,21,21,20,20,66,22,66,20,67,20,21,21,65,21,67,20,66,21],
  // [340,169,20,20,20,20,20,60,20,20,20,20,20,20,20,20,20,20,20,60,20,60,20,20,20,60,20,60,20,60,20,60,20,60,20,60,20,20,20,20,20,20,20,60,20,20,20,20,20,20,20,20,20,60,20,60,20,60,20,20,20,60,20,60,20,60,20],
  // [340,169,20,20,20,20,20,64,20,20,20,20,20,20,20,20,20,20,20,64,20,64,20,20,20,64,20,64,20,64,20,64,20,64,20,64,20,20,20,20,20,20,20,64,20,20,20,20,20,20,20,20,20,64,20,64,20,64,20,20,20,64,20,64,20,64,20],
  // [367,175,21,21,20,21,20,67,21,20,20,21,20,21,21,20,20,20,21,67,21,66,20,21,20,67,20,67,21,66,20,67,20,66,22,21,21,21,20,20,21,67,20,21,21,20,20,20,21,21,21,66,21,66,21,66,21,21,20,67,21,65,21,66,22,65,21],
  // [167,164,21,59,21,59,22,59,21,59,21,18,21,18,21,59,21,18,21,18,22,18,21,18,21,18,21,59,21,59,22,18,22,59,21,18,22,18,21,18,22,18,22,18,21,18,22,59,21,59,22,59,21,59,22,59,21,59,22,59,22,59,21,18,21,18,22,18,21,18,22,18,22,18,21,18,22,18,21,18,21,59,21,18,21,59,21,18,21,18,22,18,21,18,22,18,22,18,21,18,22,18,21,18,21,18,22,18,21,59,22,59,21,59,22,18,22,18,22,18,21,18,22,18,22,18,21,18,22,18,21,18,22,59,21,18,21,18,21,18,21,59,21,59,22,18,22,
  281,167,163,22,59,22,59,21,59,22,59,22,18,21,18,21,59,21,18,21,18,22,18,21,18,22,18,22,59,21,59,23,17,21,59,21,18,22,18,21,18,21,18,21,18,21,18,21,59,21,59,22,59,21,59,21,59,22,59,21,59,21,59,21,18,21,18,22,18,23,17,21,18,22,18,21,18,22,18,22,18,21,59,22,18,21,59,22,18,21,18,22,18,23,17,21,18,22,18,21,18,22,18,22,18,21,18,22,18,22,59,22,59,21,59,21,18,21,18,22,18,21,18,23,17,21,18,21,18,21,18,22,18,21,59,22,18,21,18,21,18,22,59,21,59,22,18,22],
  // [166,165,21,60,20,60,21,60,20,60,20,19,20,19,20,60,21,19,20,19,20,19,21,19,20,19,21,60,20,60,21,19,20,60,21,19,20,19,20,19,20,19,20,19,20,19,20,60,21,60,21,60,20,60,21,60,21,60,20,60,20,60,21,19,20,19,20,19,21,19,20,19,21,19,20,19,20,19,20,19,21,60,21,19,21,60,21,19,20,19,20,19,20,19,20,19,20,19,21,19,20,19,20,19,21,19,20,19,21,19,20,19,20,19,20,19,21,19,20,19,20,19,21,19,20,19,20,19,20,19,20,19,20,60,20,19,21,19,20,19,20,19,21,19,20,60,21,282,166,165,21,60,20,60,20,61,21,60,20,19,21,19,20,60,21,19,20,19,21,19,20,19,20,19,20,60,20,60,20,19,20,60,20,19,20,19,21,19,20,19,21,19,21,19,20,60,21,60,21,60,20,60,20,60,21,60,23,58,20,60,21,19,20,19,24,16,21,19,20,19,20,19,21,19,20,19,21,19,23,58,21,19,20,60,21,19,20,19,20,19,21,19,23,17,20,19,21,19,23,17,21,19,21,19,20,19,21,19,21,19,20,19,20,19,20,19,20,19,20,19,21,19,20,19,21,19,20,19,20,19,23,58,21,19,21,19,20,19,20,19,21,19,20,60,20],
  // [167,164,21,59,22,59,21,59,21,59,20,19,21,18,21,59,22,18,21,18,20,19,22,18,20,19,22,59,21,59,21,18,21,59,21,18,21,18,22,18,21,18,21,18,21,18,21,59,21,60,21,59,21,59,21,59,21,59,22,59,21,59,21,18,21,18,21,18,21,18,21,19,21,18,21,19,21,18,21,18,21,60,21,18,21,18,21,18,21,18,21,18,21,18,22,18,21,18,21,18,22,18,21,18,21,18,22,17,21,18,21,18,21,18,21,18,22,18,21,18,21,18,21,18,21,18,21,18,21,18,21,18,22,18,22,18,23,17,21,18,21,18,21,18,22,59,22,282,167,164,21,59,21,59,21,59,21,59,21,18,22,17,22,59,21,18,21,18,21,18,22,18,21,18,21,59,21,59,22,18,21,59,21,18,21,18,22,18,21,18,21,18,22,18,21,59,21,59,21,59,21,59,21,60,21,59,21,59,21,60,21,18,22,18,21,18,20,19,20,19,21,18,23,16,22,17,21,18,21,60,21,18,21,18,21,18,21,18,21,18,21,18,22,18,21,18,21,18,22,18,21,18,21,18,22,18,20,19,21,18,22,18,21,18,22,18,22,18,21,18,21,18,21,18,21,18,21,18,21,18,21,18,21,18,21,18,21,18,22,17,21,18,21,59,21],
  // [166,165,20,60,19,61,19,62,19,60,20,20,19,20,21,60,20,19,19,21,19,20,19,20,20,19,20,59,21,59,20,21,20,60,19,21,19,20,19,20,19,20,19,20,20,18,21,59,21,60,20,61,19,61,19,62,20,61,19,61,19,61,20,20,20,19,20,19,20,20,20,19,19,20,19,19,20,19,20,19,20,62,19,19,21,19,19,20,20,60,19,20,19,19,21,19,19,19,21,20,20,19,21,18,19,20,19,20,19,20,19,20,19,20,19,20,19,19,21,18,20,19,20,20,20,20,19,20,19,20,19,19,20,20,21,18,20,61,19,20,21,19,20,19,22,60,20,283,165,165,20,61,19,61,19,61,19,62,19,20,19,20,19,61,19,20,19,20,20,19,19,20,19,21,18,61,19,61,20,19,20,60,19,20,19,20,19,21,19,20,19,20,20,20,18,61,19,62,19,61,19,62,18,61,20,61,19,61,19,62,18,20,19,20,21,18,19,20,19,20,20,20,19,20,19,20,20,21,18,63,18,21,19,19,19,20,20,60,20,20,19,21,19,21,18,21,19,19,19,19,20,21,18,21,19,21,18,20,19,21,19,21,18,21,18,21,18,21,18,20,19,21,18,21,18,20,19,20,20,21,19,20,18,22,17,60,20,20,19,20,19,21,20,61,18],
  // [167,164,22,59,21,59,22,59,22,59,21,18,22,18,21,59,21,18,21,18,21,18,22,18,21,18,21,59,21,59,22,18,21,59,22,18,21,18,22,18,22,18,21,18,22,18,22,59,22,59,21,59,21,59,22,59,21,59,22,59,22,59,21,18,22,18,21,18,22,18,22,18,21,18,22,18,22,18,21,18,22,59,22,18,22,18,22,59,22,18,22,18,21,18,22,18,21,18,22,18,22,18,21,18,22,18,22,18,21,18,22,18,21,18,21,18,22,18,22,18,21,18,22,18,21,18,22,18,22,18,21,18,21,18,21,59,22,18,22,18,21,18,22,18,22,59,22,281,167,163,22,59,21,59,21,59,22,59,21,18,21,18,22,59,22,18,22,18,21,18,22,18,21,18,21,59,21,59,21,18,21,59,22,18,21,18,22,18,22,18,21,18,21,18,22,59,21,59,22,59,23,58,21,59,22,59,21,59,21,59,22,18,22,18,21,18,22,18,22,18,21,18,21,18,22,18,21,18,22,59,22,18,22,18,22,59,22,18,21,18,21,18,22,18,21,18,21,18,22,18,21,18,21,18,22,18,21,18,22,18,22,18,21,18,21,18,22,18,21,18,21,18,22,18,21,18,22,18,22,18,21,18,22,59,21,18,21,18,22,18,21,18,22,59,21],
     [167,164,21,59,20,60,21,59,22,59,21,18,21,18,21,59,21,18,20,19,20,19,21,18,21,18,21,59,21,60,21,18,21,59,21,18,21,18,21,18,22,18,21,19,21,18,21,59,21,59,21,59,21,59,22,59,21,59,21,59,21,60,21,18,21,18,21,19,20,19,21,18,21,18,20,19,21,18,21,18,21,59,21,18,21,18,21,59,21,59,21,18,20,19,21,18,20,19,22,17,22,17,20,19,21,18,21,18,21,18,21,19,20,19,20,19,21,19,20,19,21,18,21,18,22,17,21,18,20,19,20,19,20,19,21,59,21,60,22,18,21,19,20,19,21,59,21,
  282,165,165,21,61,19,61,19,60,20,60,21,19,20,20,19,61,20,19,19,21,20,18,21,19,20,19,21,60,21,60,19,20,21,60,19,20,19,21,19,20,19,20,20,19,19,20,20,60,19,61,19,61,19,61,20,61,19,61,21,60,19,61,19,20,20,19,19,20,19,20,20,19,19,20,19,20,19,19,20,20,19,61,19,20,20,18,21,60,20,61,20,19,19,21,19,21,18,20,19,20,19,21,18,21,18,21,19,20,19,20,20,19,19,20,20,20,20,19,19,20,20,21,18,20,19,21,18,21,18,20,20,20,19,21,19,63,18,61,19,20,19,20,19,21,18,62,18],
  // [167,164,21,59,22,59,21,59,21,59,21,18,21,18,22,59,22,18,22,18,21,18,22,18,22,18,21,59,22,59,21,18,21,59,22,18,21,18,22,18,22,18,21,18,21,18,22,59,21,59,22,59,21,59,22,59,21,59,22,59,22,59,22,18,22,18,21,18,22,18,22,18,21,18,22,18,21,18,21,18,22,59,21,18,21,59,21,18,21,18,21,18,21,18,22,18,21,18,22,18,21,18,21,18,22,18,21,18,21,18,22,18,23,17,21,18,21,18,21,18,21,18,22,18,21,18,22,18,23,17,21,18,22,59,21,18,22,18,21,18,21,18,22,18,21,59,21,282,168,163,22,59,21,59,21,59,21,59,22,18,21,18,21,59,21,18,21,18,21,18,21,18,21,18,22,59,21,59,22,18,22,59,22,18,22,18,21,18,21,18,21,18,21,18,21,59,21,59,21,59,21,59,22,59,21,59,21,59,22,59,21,18,21,18,21,18,21,18,21,18,21,18,21,18,22,18,21,18,21,59,21,18,20,60,21,19,21,18,22,18,21,18,21,18,21,18,21,18,21,18,21,18,21,18,21,18,21,18,21,18,22,18,21,18,23,17,20,19,21,18,21,18,22,18,21,18,22,18,20,19,21,59,21,18,21,18,22,18,21,18,21,18,22,59,21],
  // [158,164,21,59,22,59,21,59,22,59,21,18,22,18,21,59,22,18,22,18,22,18,21,18,22,18,22,59,22,59,21,18,22,59,22,18,22,18,22,18,21,18,21,18,21,18,22,59,22,59,21,59,21,59,22,59,21,59,22,59,21,59,21,18,21,18,21,18,22,18,21,18,22,18,22,18,21,18,22,18,21,59,22,18,21,59,22,18,21,18,22,18,21,18,22,18,22,18,21,18,22,18,22,18,21,18,22,18,21,18,21,18,22,59,22,18,22,18,22,18,21,18,21,18,22,18,22,18,21,18,22,18,22,59,21,18,21,18,21,18,22,18,22,18,21,18,22,281,166,165,21,60,20,60,21,60,20,60,21,19,20,19,20,60,20,19,20,19,20,19,21,19,20,19,20,60,21,60,21,19,20,60,21,19,20,19,20,19,21,19,20,19,21,19,21,60,21,60,20,60,20,60,21,60,21,60,20,60,20,60,21,19,20,19,21,19,20,19,21,19,20,19,20,19,20,19,21,19,20,60,21,19,20,60,20,19,20,19,21,19,20,19,21,19,21,19,20,19,20,19,20,19,20,19,21,19,20,19,21,19,21,60,20,19,21,19,20,19,21,19,20,19,20,19,21,19,20,19,20,19,21,60,21,19,20,19,20,19,21,19,20,19,21,19,21],
  // [167,163,22,59,21,59,22,59,21,60,22,18,21,18,20,60,21,18,22,18,22,18,21,18,20,19,21,59,22,59,20,19,20,60,20,19,22,18,21,18,22,18,21,18,21,18,24,57,21,59,23,58,21,59,21,60,20,60,20,60,21,59,22,18,21,18,21,18,22,18,23,17,22,18,22,18,21,18,20,19,21,59,22,18,21,59,22,18,21,18,21,18,23,17,22,17,21,18,21,18,23,17,22,18,20,19,22,18,21,18,23,58,21,18,20,19,22,18,24,16,21,18,21,18,21,18,22,18,21,18,22,18,22,59,24,16,22,18,21,18,21,19,22,59,22,59,20,282,167,163,22,59,21,59,22,59,22,59,21,18,21,18,21,59,21,18,21,18,22,18,21,18,22,18,21,59,22,59,21,18,22,59,22,18,22,18,21,18,22,18,21,18,23,17,21,59,22,59,21,59,23,58,22,59,21,59,22,59,22,59,22,18,21,18,21,18,22,18,21,18,22,18,22,18,21,18,22,18,21,59,21,18,21,59,22,18,21,18,21,18,21,18,21,18,22,18,21,18,21,18,22,18,21,18,22,18,22,18,21,59,21,18,21,18,22,18,21,18,22,18,22,18,21,18,22,18,23,17,21,18,21,59,22,18,22,18,21,18,22,18,22,59,21,59,23],
  // [167,163,22,59,22,59,21,59,21,59,22,18,22,18,21,59,22,18,21,18,22,18,21,18,21,18,22,59,22,59,21,18,22,59,21,18,22,18,22,18,21,18,22,18,21,18,22,59,22,59,21,59,21,59,22,59,21,59,21,59,22,59,21,18,22,18,21,18,22,18,21,18,21,18,22,18,21,18,21,18,22,59,21,18,21,59,22,18,23,17,21,18,21,18,21,18,22,18,21,18,21,18,23,17,21,18,21,18,22,18,21,59,21,59,21,18,21,18,21,18,22,18,21,18,21,18,21,18,20,19,20,19,21,59,21,18,21,18,20,19,21,19,22,59,22,17,21,282,166,165,20,60,20,60,21,60,21,59,21,18,21,19,22,59,21,18,20,19,20,19,21,18,22,18,21,59,20,60,21,19,19,60,21,18,20,19,21,19,19,20,20,19,19,19,20,60,20,60,21,59,21,60,19,60,20,61,20,59,21,60,19,19,21,19,19,19,21,18,20,19,20,19,21,19,19,21,19,20,19,60,20,20,19,60,21,20,20,19,19,20,19,20,19,20,19,20,19,19,20,19,22,17,20,21,19,19,20,20,19,61,20,60,20,20,19,19,21,18,20,20,20,19,19,20,20,18,21,18,20,19,21,61,19,19,20,20,19,19,21,18,20,60,22,18,19],
  // [166,164,21,60,21,60,20,60,21,60,20,19,21,19,20,60,21,19,20,19,21,19,20,19,20,19,20,60,21,60,20,19,20,60,21,18,21,19,22,17,21,19,21,19,20,19,20,60,21,59,21,60,21,60,20,60,20,60,21,60,21,60,20,19,21,19,20,19,21,19,20,19,20,19,20,19,21,19,20,19,20,60,20,19,21,60,21,19,20,60,21,19,21,19,20,19,20,19,21,19,20,19,21,19,20,19,20,19,21,60,20,19,21,19,20,19,21,19,21,19,22,18,21,19,20,19,20,19,21,19,20,19,20,60,20,19,20,60,21,18,22,59,22,18,21,60,21,282,166,165,21,60,20,60,21,60,21,60,21,19,20,19,20,60,21,19,20,19,20,19,21,19,22,18,20,60,21,60,20,19,20,60,20,19,20,19,21,19,20,19,21,19,20,19,20,60,20,60,21,60,20,60,20,60,21,60,21,60,21,60,20,19,21,19,21,18,21,18,22,18,20,19,20,19,21,19,20,19,20,60,20,19,20,60,20,19,20,60,20,19,20,19,20,19,20,19,23,17,20,19,20,19,21,19,20,19,20,60,21,19,20,19,20,19,20,19,21,19,20,19,20,19,21,19,20,19,21,19,21,19,20,60,20,19,20,60,20,19,20,60,20,19,20,60,21],
  // [167,164,21,59,21,59,22,59,21,59,21,18,21,18,21,59,22,18,21,18,22,18,22,18,21,18,22,59,21,59,21,18,21,59,21,18,21,18,21,18,21,18,22,18,21,18,21,59,21,59,21,59,22,59,21,59,21,59,22,59,20,60,21,18,21,18,21,18,21,18,22,18,21,18,21,18,22,18,21,18,22,59,22,18,22,59,22,18,22,59,21,18,23,17,21,18,22,18,21,18,21,18,21,18,21,18,21,18,22,59,22,59,21,59,21,18,21,18,22,18,21,18,22,18,22,18,21,18,22,18,21,18,21,59,21,18,21,59,23,17,21,59,21,59,22,17,21,281,167,163,22,59,21,59,21,59,22,59,21,18,22,18,21,59,21,18,21,18,21,18,21,18,22,18,21,59,21,59,22,18,22,59,21,18,21,18,21,18,21,18,21,18,21,18,21,59,21,59,21,59,21,59,22,59,21,59,21,59,22,59,21,18,22,18,21,18,21,18,21,18,21,18,21,18,21,18,21,18,22,59,22,18,21,59,22,18,21,59,22,18,21,18,22,18,21,18,21,18,22,18,21,18,21,18,22,18,21,59,23,58,21,59,22,18,22,18,21,18,21,18,22,18,21,18,22,18,21,18,21,18,22,59,21,18,21,59,21,18,21,59,22,59,21,18,21],
  // [167,163,22,59,22,58,21,59,21,59,22,18,21,18,22,59,21,18,21,18,21,18,21,18,22,18,21,59,22,59,22,18,21,59,22,18,21,18,23,17,21,18,21,18,21,18,22,59,22,59,21,59,21,59,21,59,22,59,21,59,21,59,22,18,21,18,22,18,22,18,21,18,22,18,23,17,21,18,21,18,21,59,21,18,21,59,21,18,21,59,21,18,21,18,22,18,21,18,22,18,21,18,21,18,22,18,24,16,21,59,21,18,21,18,22,18,21,18,22,18,21,18,21,18,22,18,21,18,21,18,22,18,21,59,22,18,21,59,21,18,21,59,22,18,22,59,21,282,167,164,21,59,21,59,22,59,22,59,21,18,22,18,21,59,22,18,21,18,21,18,22,18,21,18,22,59,22,59,21,18,22,59,22,18,22,18,21,18,22,18,22,18,21,18,21,59,21,59,21,59,22,59,21,59,21,59,22,59,21,59,22,18,22,18,21,18,22,18,21,18,21,18,22,18,21,18,21,18,22,59,21,18,22,59,22,18,22,59,21,18,23,17,21,18,22,18,21,18,22,18,22,18,21,18,22,18,21,59,22,18,21,18,22,17,22,18,21,18,22,18,22,18,21,18,22,18,21,18,21,18,22,59,21,18,22,59,22,18,21,59,22,18,21,59,22],
  // [165,166,19,61,19,62,19,61,19,61,19,21,18,21,18,63,19,19,20,19,19,21,19,20,18,21,18,62,18,61,20,18,21,60,19,20,19,19,20,20,19,21,18,21,18,21,18,62,19,61,18,61,19,61,19,62,18,62,19,62,19,62,18,20,19,21,19,19,19,21,18,20,19,20,19,21,18,21,18,21,18,61,19,21,19,60,21,19,20,21,18,20,19,21,18,20,19,20,19,21,18,63,18,21,18,21,18,20,20,19,19,20,19,21,19,19,21,19,19,20,19,20,19,21,19,20,18,21,18,21,18,21,18,21,18,20,19,21,18,21,18,19,20,21,19,61,20,284,164,166,19,62,20,60,19,61,19,61,19,21,18,20,19,62,18,20,19,21,18,20,20,20,18,20,19,62,18,62,18,21,18,61,19,20,19,21,18,20,19,20,19,21,18,21,18,61,20,61,19,62,18,61,19,63,18,61,19,61,19,61,19,20,19,21,20,20,18,21,18,20,19,20,19,20,19,20,19,20,20,60,20,20,20,60,20,19,19,20,19,20,20,19,19,20,19,20,20,19,19,62,18,20,19,20,20,21,18,21,20,18,21,19,20,20,19,20,19,20,21,19,19,20,20,19,19,20,20,20,19,20,19,20,20,19,19,20,20,19,20,18,20,21,18,61,20],
  // [166,165,19,61,20,61,19,61,19,61,20,19,19,20,20,60,20,19,20,20,19,21,19,20,19,20,19,61,20,61,20,19,20,61,19,20,19,20,20,19,20,20,19,21,20,19,19,61,19,61,21,60,19,61,20,60,19,61,19,61,19,62,20,20,19,20,19,21,18,20,19,20,19,20,19,21,18,20,19,20,19,62,19,20,19,61,20,21,18,20,19,20,19,20,19,20,19,20,19,21,19,61,19,63,18,21,18,20,19,21,18,20,20,19,19,21,18,21,19,21,19,19,19,21,18,21,18,21,18,20,19,20,19,21,18,61,19,20,19,21,18,20,20,18,20,63,20,283,164,167,18,63,17,63,18,62,18,62,18,21,18,21,18,63,19,20,18,21,18,20,20,19,21,18,20,62,18,63,18,21,19,62,18,20,19,21,19,21,17,22,17,20,20,22,17,62,18,63,17,62,18,63,17,61,19,62,19,60,20,63,18,21,18,22,17,20,19,21,18,20,19,22,17,21,18,21,19,19,19,62,18,21,18,62,18,22,17,22,18,19,19,21,19,19,20,20,18,20,19,63,18,62,18,20,18,23,17,22,17,19,21,21,19,21,18,22,16,21,18,25,14,20,19,21,20,21,17,22,17,22,17,23,17,62,18,20,19,20,20,20,20,19,19,61,19],
  // [166,165,21,60,20,60,20,60,20,60,22,18,21,18,20,60,21,19,22,18,21,18,20,19,22,18,20,60,21,59,22,18,22,59,21,18,21,18,20,20,21,18,20,19,21,18,21,59,20,62,20,60,21,60,20,60,20,60,21,60,22,58,21,18,21,18,20,19,22,18,21,18,21,18,20,19,21,18,20,19,21,60,21,19,20,60,21,18,21,19,22,18,22,18,21,18,20,19,20,60,22,18,21,18,20,19,22,18,20,19,20,19,22,18,20,19,20,19,21,18,21,18,20,19,21,18,21,18,20,19,20,60,21,60,21,18,21,18,21,19,21,18,21,18,21,60,21,282,166,165,21,60,20,60,20,60,20,61,20,19,21,18,21,59,20,19,20,19,21,19,21,19,19,19,21,59,21,60,21,19,20,60,20,19,20,19,21,18,20,19,21,18,21,18,21,59,20,60,21,59,21,59,21,59,21,59,21,59,21,60,22,18,21,18,21,18,21,18,20,19,20,19,20,19,20,19,22,18,21,59,21,19,19,60,22,18,20,19,22,18,20,19,21,18,20,19,21,59,22,18,20,19,21,18,20,19,21,19,22,19,20,18,21,18,22,18,20,19,21,18,21,19,20,19,22,18,22,18,21,59,21,59,21,18,20,19,20,19,22,18,21,19,20,60,21],
  // [167,164,21,59,21,60,20,60,21,59,21,18,21,18,22,59,20,19,21,18,20,19,22,18,21,18,21,59,21,59,20,19,21,59,21,19,22,18,24,16,21,19,22,18,21,18,21,60,21,59,21,59,22,59,21,59,22,59,21,59,20,60,21,18,20,19,22,18,21,18,21,18,21,18,21,18,21,18,20,19,20,60,21,18,21,59,20,19,22,18,21,18,21,18,22,18,20,19,21,59,21,19,22,59,21,18,21,18,21,18,21,18,22,17,22,17,21,18,22,18,21,19,22,18,21,18,21,18,21,18,21,59,21,60,21,59,20,20,21,18,20,19,20,20,21,59,22,281,166,165,21,59,22,59,21,59,22,59,21,18,21,18,21,59,21,18,21,18,21,18,21,18,21,18,21,59,22,59,20,19,22,59,21,18,20,19,21,18,21,18,20,19,21,18,21,59,20,61,21,59,21,59,20,60,21,59,21,59,21,59,22,18,22,18,21,18,21,18,21,18,21,18,21,18,20,19,21,18,21,59,22,18,22,59,21,18,20,19,21,19,22,18,21,18,21,18,21,59,21,18,21,59,20,19,20,19,21,18,21,18,21,18,21,18,21,18,21,19,22,18,22,18,20,19,20,19,21,18,21,59,22,58,20,60,21,18,20,19,21,18,20,19,23,57,20],
  // [167,164,21,59,20,60,21,59,21,59,20,19,21,18,20,60,21,19,22,18,21,18,21,18,21,18,20,60,20,60,20,19,21,59,21,18,21,18,21,18,20,19,21,18,20,19,20,60,21,59,21,59,21,60,21,59,20,60,21,59,22,59,21,18,20,19,21,18,22,18,24,15,21,18,20,19,21,18,20,19,21,59,22,18,21,59,21,19,20,19,21,18,21,18,21,18,21,18,21,59,22,59,20,19,20,19,21,18,20,19,21,18,21,18,21,18,21,18,20,19,20,19,21,19,22,18,22,18,20,19,21,59,23,17,20,19,21,18,21,18,21,18,21,19,22,59,21,282,166,165,20,60,21,60,22,58,21,59,21,18,20,19,21,60,21,19,21,18,20,19,20,19,20,19,21,59,21,59,21,19,22,59,21,18,21,18,20,19,21,18,20,19,21,18,21,59,21,59,20,60,20,60,20,61,21,59,21,59,21,59,21,18,20,19,20,19,20,20,21,18,20,19,20,19,20,19,20,19,21,59,21,18,20,60,20,19,22,18,20,19,20,19,20,19,21,19,20,60,20,60,21,19,21,18,20,19,21,19,20,19,20,19,21,18,22,18,20,19,21,18,22,18,21,18,20,19,20,19,20,60,21,18,21,18,20,19,21,19,21,18,20,19,21,59,22],
  // [166,165,22,59,21,59,21,59,21,59,20,19,20,19,21,59,20,19,21,18,22,18,20,19,21,18,20,60,21,59,21,18,21,59,22,18,22,18,21,18,21,18,21,18,21,18,21,59,21,60,21,59,22,59,21,59,21,59,21,60,20,60,21,18,20,19,21,18,21,18,20,19,20,20,21,18,20,19,21,18,20,60,21,18,20,60,21,18,21,18,21,18,22,17,21,18,21,18,21,18,21,59,20,19,22,17,21,18,20,19,20,19,22,18,21,18,21,18,20,19,21,18,21,18,22,18,21,19,22,18,21,18,20,19,22,18,20,19,21,18,22,18,21,18,21,59,21,282,167,164,20,60,21,59,22,59,20,60,21,19,20,19,20,60,21,18,21,19,20,19,20,19,20,19,21,59,21,59,20,19,21,59,23,17,20,19,22,18,21,19,22,18,21,18,21,60,20,60,21,60,21,59,21,59,21,60,21,59,20,60,21,18,21,18,20,19,20,19,21,18,20,19,21,18,22,18,20,19,20,60,21,18,20,60,21,19,20,19,20,19,21,18,21,18,21,19,22,18,20,60,21,18,21,18,21,18,21,18,21,18,21,18,21,18,21,19,22,18,22,18,20,19,21,18,20,19,21,19,20,19,22,18,21,18,22,18,20,19,21,18,22,18,20,60,21],
  // [166,165,20,60,21,59,21,59,20,61,20,18,20,19,21,59,21,19,22,18,21,18,21,20,20,18,20,60,24,57,20,19,22,59,21,18,20,19,21,18,20,19,21,19,21,18,20,60,20,60,21,60,21,59,20,60,21,59,21,60,21,60,21,18,21,18,20,21,19,19,21,19,20,18,21,19,21,18,20,19,20,60,21,18,21,59,20,20,19,19,22,18,20,19,21,18,20,19,20,19,20,60,21,19,21,18,20,19,21,19,20,19,21,60,22,18,21,18,20,19,22,18,21,18,22,18,20,19,20,21,19,19,20,19,20,19,22,18,21,18,20,19,20,19,20,19,21,281,166,164,22,59,21,59,20,60,21,60,20,19,21,19,22,59,21,19,19,19,20,20,19,19,21,18,21,60,20,60,21,18,21,59,21,18,20,19,20,19,20,19,20,19,21,19,19,60,21,59,21,59,21,60,21,60,21,59,22,59,20,61,19,20,19,19,20,21,21,17,21,18,20,19,21,19,21,18,20,19,21,60,21,19,21,60,21,20,19,19,20,19,21,18,21,18,20,19,21,18,20,60,21,18,21,18,20,19,21,18,20,19,21,60,20,19,21,18,20,19,20,19,21,19,21,18,21,18,20,19,21,18,21,19,20,19,20,19,21,18,20,19,21,19,21,18,20],
];

const s = a => a.map(i => i.toString(16).padStart(2, '0')).join(' ');

function decode (a) {
  let j = 0;
  let x = 0;
  let i = 3;
  const code = [];
  const n = a.length;
  while (i < n) {
      if (j === 8) {
      code.push(x);
      x = 0;
      j = 0;
    }
    const b = a[i] > threshold ? 1 : 0
    x = (x << 1) | b;
    i += 2;
    j++;
  }
  code.push(x);
//   j = 0;
//   x = 0;
//   i += 2;
//   while (i < n) {
//     if (j === 8) {
//     code.push(x);
//     x = 0;
//     j = 0;
//   }
//   const b = a[i] > threshold ? 1 : 0
//   x = (x << 1) | b;
//   i += 2;
//   j++;
// }
// code.push(x);
// const crc = code.slice(0, 8).reduce((a, b) => a ^ b).toString(16).padStart(2, '0');
//   const t = (code[5] >> 4) + 17;
//   const m = code[6] & 0xf;
//   let f = (code[6] >> 5);
//   f = f ? f - 1 : 0;
//   console.log(
//     s(code),
//     ' crc:', crc,
//     ' t:', t,
//     ' on/off/mode:', m,
//     ' fan:', f
//   );
//   console.log(s(encode(m !== 7, m, f, t)));
//   console.log('\n');

  const data = ir(340, 169, code);

  const buff = Buffer.alloc(data.length * 2 + 5);
  buff.writeUInt8(ACTION_IR, 0);
  buff.writeUInt8(index, 1);
  buff.writeUInt8(0, 2);
  buff.writeUInt16BE(frequency, 3);
  for (let i = 0; i < data.length; i++) {
    buff.writeUInt16BE(data[i], i * 2 + 5);
  }
  device.send(buff, DEVICE_PORT, ip, console.error);

  console.log(s(code));
  console.log(data.join(','));


}

function encode(power, mode, fan, setpoint) {
  const code = [0xf2, 0x0d, 0x03, 0xfc, 0x01, 0, 0, 0];
  let t = setpoint < 17 ? 0 : (setpoint - 17);
  code[5] = (t & 0xf) << 4;
  code[6] = ((fan ? ((fan + 1) & 0x7) : 0 ) << 5) | (power ? (mode & 0x3) : 0x7)
  code[8] = code.reduce((a, b) => a ^ b);
  return code;
}

function ir(a, b, c) {
  const code = [a, b];
  c.forEach(a => {
    for (let i = 0b10000000; i > 0; i >>= 1) {
      if (a & i) {
        code.push(20);
        code.push(60);
      } else {
        code.push(20);
        code.push(20);
      }
    }
  });
  code.push(20);
  return code;
}

b.forEach(a => decode(a));

// e1 a5 a3 f2 f4 f6 f7
//  1 27 21 16 14 12 11
