
module.exports.sleep = t => new Promise(resolve => {
  setTimeout(resolve, t);
});

module.exports.hashCode = s => {
  let h = 0, i = s.length - 1;
    while (i >= 0)
      h = Math.imul(31, h) + s.charCodeAt(i--);
  return h > 0 ? h : Number.MAX_SAFE_INTEGER + h;
};
