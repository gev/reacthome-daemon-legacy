module.exports.sleep = (t) =>
  new Promise((resolve) => {
    setTimeout(resolve, t);
  });

module.exports.hashCode = (s) => {
  let h = 0,
    i = s.length - 1;
  while (i >= 0) h = Math.imul(31, h) + s.charCodeAt(i--);
  return h > 0 ? h : Number.MAX_SAFE_INTEGER + h;
};

export const ip2int = (ip) =>
  ip.split(".").reduce((a, b) => (a << 8) | parseInt(b), 0) >>> 0;

export const int2ip = (ip) =>
  `${(ip >> 24) & 0xff}.${(ip >> 16) & 0xff}.${(ip >> 8) & 0xff}.${ip & 0xff}`;
