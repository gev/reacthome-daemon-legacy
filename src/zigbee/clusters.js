
const { DO, COLOR } = require('../constants');

const clusters = new Map();

clusters.set(0x0006, {
  type: [
    DO
  ], 
  config: {
    genOnOff: [{
      attribute: 'onOff',
      minimumReportInterval: 0,
      maximumReportInterval: 3600,
      reportableChange: 0,
    }]
  }
});
clusters.set(0x0300, {
  type: [
    COLOR
  ], 
  // config: [
  //   {}
  // ]
});

module.exports = clusters;
