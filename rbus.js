const { rbus } = require("./src/rbus");

rbus('172.16.1.1');
// rbus('172.16.1.1', '/dev/ttyAMA0', );
// rbus('172.16.2.1', '/dev/ttyAMA1', );

// uart1 
// rx 9
// tx 8
// out 12

// uart2
// rx 5
// tx 4
// out 16