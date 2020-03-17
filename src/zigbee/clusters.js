
const { DO, COLOR } = require('../constants');

const clusters = new Map();

clusters.set(0x0006, DO);
clusters.set(0x0300, COLOR);

module.exports = clusters;
