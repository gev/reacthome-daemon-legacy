const { rbus } = require("./src/rbus");

rbus(1, '127.0.1.1', '/dev/ttyAMA2', 12);
rbus(2, '127.0.1.2', '/dev/ttyAMA1', 16);

// uart1 
// rx 9
// tx 8
// out 12

// uart2
// rx 5
// tx 4
// out 16