const os = require('os');
const { rbus } = require("./src/rbus/v4");

const ifaces = os.networkInterfaces();
const mac = (ifaces.eth0 || ifaces.eth1)[0]
  .mac.split(':').map(i => parseInt(i, 16));

setTimeout(rbus, 10_000, mac, '127.0.1.1', '/dev/ttyAMA0')
