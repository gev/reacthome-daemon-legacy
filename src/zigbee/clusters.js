
const { DO, COLOR } = require('../constants');

const clusters = new Map();

clusters.set(0x0006, {
  type: [
    DO
  ], 
  config: [
    {}
  ]
});
clusters.set(0x0300, {
  type: [
    COLOR
  ], 
  config: [
    {}
  ]
});

module.exports = clusters;
