const os = require('os');
<<<<<<<< HEAD:rbus3.js
const { rbus } = require("./src/rbus/v3");
========
const { rbus } = require("./src/rbus/v2");
>>>>>>>> 4587808 (up):rbus2.js

const ifaces = os.networkInterfaces();
const mac = (ifaces.eth0 || ifaces.eth1)[0]
  .mac.split(':').map(i => parseInt(i, 16));

setTimeout(rbus, 10_000, mac, '127.0.1.1', '/dev/ttyAMA0')
