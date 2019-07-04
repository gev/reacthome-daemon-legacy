
function join(d, r, l, c) {
  const a = [];
  let s = 0;
  for (let i = 0; i < d; i++) {
    let l_ = l;
    let c_ = c;
    if (i < r)  l_++;
    if (c_ === l_) c_++;
    a.push([s, s + l_]);
    s += c_;
  }
  return a;
}

function test(a) {
  const b = 255 - a;
  const x = a < b ? a : b;
  const c = Math.max(Math.floor(256 / x), 32);
  let d = Math.min(Math.floor(256 / c), a);
  const l = Math.max(Math.min(Math.floor(a / d)), 1);
  const rd = a - (l * d);
  // d = d - rd;
  const rl = l + 1;
  const fill = c * d + c * rd
  const z = join(d, rd, l, c);
  // return z;
  for (let i = z.length; i < 8; i++) z.push([0, 0]);
  return `{${d}, {${z.map(i => `{${i.join(', ')}}`).join(', ')}}}`;
}

const pwm = []
for (let i = 1; i < 255; i++) {
  pwm.push(test(i));
}

// pwm.forEach((v,i) => console.log(i+1, v.join(', ')));
console.log(pwm.join(',\n '))
