
const { get, set } = require('./create');

const count_on = (site, type, bind) => {
  const { count = {}, parent } = get(site);
  const a = count[type];
  if (Array.isArray(a)) {
    if (!a.includes(bind)) {
      a.push(bind);
      set(site, { count: { ...count, [type]: a } });
    }
  } else {
    set(site, { count: { ...count, [type]: [bind] } });
  }
  if (parent) count_on(parent, type);
};

module.exports.count_on = count_on;

const count_off = (site, type) => {
  const { count = {}, parent } = get(site);
  const a = count[type];
  if (Array.isArray(a)) {
    if (a.includes(bind)) {
      delete a[bind];
      set(site, { count: { ...count, [type]: a } });
    }
  }
  if (parent) count_off(parent, type);
}

module.exports.count_off = count_off;

const count = (site) => {
  const o = get(site);
  if (o.count) Object.keys(o.count).forEach(type => {
    o.count[type] = 0;
    // const a = o[type];
    // if (Array.isArray(a)) {
    //   const { bind } = 
    // }
  });
  if (Array.isArray(o.site)) o.site.forEach(i => count(i));
}