
const { get, set } = require('./create');

const count_on = (site, type, id) => {
  const { count = {}, parent } = get(site) || {};
  const a = count[type];
  if (Array.isArray(a)) {
    if (!a.includes(id)) {
      set(site, { count: { ...count, [type]: [...a, id] } });
    }
  } else {
    set(site, { count: { ...count, [type]: [id] } });
  }
  if (parent) count_on(parent, type, id);
};

module.exports.count_on = (id) => {
  const { site, type } = get(id) || {};
  count_on(site, type, id);
};

const count_off = (site, type, id) => {
  const { count = {}, parent } = get(site) || {};
  const a = count[type];
  if (Array.isArray(a)) {
    if (a.includes(id)) {
      set(site, { count: { ...count, [type]: a.filter(i => i !== id) } });
    }
  }
  if (parent) count_off(parent, type, id);
}

module.exports.count_off = (id) => {
  const { site, type } = get(id) || {};
  count_off(site, type, id);
};

const count = (site) => {
  const o = get(site) || {};
  Object.keys(o).forEach(type => {
    const a = o[type];
    if (Array.isArray(a)) {
      const { on, bind } = get(id) || {};
      a.forEach(id => {
        if (on === true) {
          // count_on(site, type, id);
        } else if (bind) {
          const { value } = get(bind) || {};
          if (value) {
            count_on(site, type, id);
          }
        }
      })
    }
    if (Array.isArray(o.site)) o.site.forEach(i => count(i));
  });
}