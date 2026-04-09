const { rbus } = require("./src/rbus");

setTimeout(() => {
  rbus('127.0.1.1', '/dev/ttyAMA0');
}, 3_000);
