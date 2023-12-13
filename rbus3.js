const os = require('os');
<<<<<<< HEAD:rbus1.js
<<<<<<<< HEAD:rbus4.js
const { rbus } = require("./src/rbus/v4");
========
const { rbus } = require("./src/rbus/v1");
>>>>>>>> 32794ae (up):rbus1.js
=======
const { rbus } = require("./src/rbus/v3");
>>>>>>> 2d7ea5b (up):rbus3.js

const ifaces = os.networkInterfaces();
const mac = (ifaces.eth0 || ifaces.eth1)[0]
  .mac.split(':').map(i => parseInt(i, 16));

setTimeout(rbus, 10_000, mac, '127.0.1.1', '/dev/ttyAMA0')
