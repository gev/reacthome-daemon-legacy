
const { get, set } = require('./create');

const count_on = (site, type) => {
  const { count = {}, parent } = get(site);
  const n = count[type];
  set(site, { count: { 
    ...count, 
    [type]: (Number.isInteger(n) && n < 0) ? 0 : n + 1
  } });
  if (parent) count_on(parent, type);
};

module.exports.count_on = count_on;

const count_off = (site, type) => {
  const { count = {}, parent } = get(site);
  const n = count[type];
  set(site, { count: {
    ...count,
    [type]: (Number.isInteger(n) && n > 0) ? n - 1 : 0
  } });
  if (parent) count_off(parent, type);
};

module.exports.count_off = count_off;

