
const { get, set } = require('./create');

const count_on = (site, type, id) => {
  const { count = {}, parent } = get(site);
  const a = count[type];
  if (Array.isArray(a)) {
    if (!a.includes(id)) {
      a.push(id);
      set(site, { count: { ...count, [type]: a } });
    }
  } else {
    set(site, { count: { ...count, [type]: [id] } });
  }
  if (parent) count_on(parent, type, id);
};

module.exports.count_on = (id) => {
  const { site, type } = get(id);
  count_on(site, type, id);
};

const count_off = (site, type, id) => {
  const { count = {}, parent } = get(site);
  const a = count[type];
  if (Array.isArray(a)) {
    const i = a.indexOf(id);
    if (i >= 0) {
      delete a[i];
      set(site, { count: { ...count, [type]: a } });
    }
  }
  if (parent) count_off(parent, type, id);
}

module.exports.count_off = (id) => {
  const { site, type } = get(id);
  count_off(site, type, id);
};

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