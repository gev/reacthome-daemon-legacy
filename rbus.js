const os = require('os');
const { rbus } = require("./src/rbus");

const ifaces = os.networkInterfaces();
const mac = (ifaces.eth0 || ifaces.eth1)[0]
  .mac.split(':').map(i => parseInt(i, 16));

const mac1 = mac;
const mac2 = mac;

mac1[0] = mac1[0] & 0b1111_1110;
mac2[0] = mac2[0] | 0b0000_0001;

rbus(mac1, '127.0.1.1', '/dev/ttyAMA2', 12);
rbus(mac2, '127.0.1.2', '/dev/ttyAMA1', 16);

// uart1 
// rx 9
// tx 8
// out 12

// uart2
// rx 5
// tx 4
// out 16