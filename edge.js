
const n = 255;

const S = 2 / n;

const s = [];

let a = 0;

for (let i = 0; i <= n; i++) {
  const x = Math.acos(1 - a);
  s[i] = Math.round(n * x / Math.PI);
  a += S;
}

console.log(s.join(', '));
