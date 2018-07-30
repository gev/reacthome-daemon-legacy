

let b = 0
const a = [];
for (let i = 0; i < 1000000; i++) {
  const x =  Math.random();
  a.push(x);
  if (a.length > 512) a.shift();
  b = (((a.length * 2 - 1) * b) + x) / (a.length * 2);
  console.log(a.reduce((a, b) => a + b) / a.length, b);
}
