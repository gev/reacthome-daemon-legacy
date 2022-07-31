const { default: rbus } = require("./src/rbus");

rbus('127.0.1.1', '/dev/ttyAMA0', 'gpio1')
rbus('127.0.1.2', '/dev/ttyAMA2', 'gpio2')