
a=[];
for (let i = 0; i < 256; i++) {
  a.push(Math.round(i*i/2))
}
console.log(a.join(','))