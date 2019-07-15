
// const n = 255;

// const S = 2 / n;

// const s = [];

// let a = 0;

// for (let i = 0; i <= n; i++) {
//   const x = Math.acos(1 - a);
//   s[i] = Math.round(n * x / Math.PI);
//   a += S;
// }

// console.log(s.join(', '));


const n = 255;

const S = 2 / (n + 1);

const s = new Array(n + 1);

let a = 0;

s.fill(255);

for (let i = 0; i < n / 2; i++) {
  const x = Math.asin(a);
  s[i] = s[255 - i] = Math.round(2 * n * x / Math.PI);
  a += S;
}

console.log(s.join(', '));
console.log(s.length);