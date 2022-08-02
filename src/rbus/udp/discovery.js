const { ACTION_DISCOVERY, ACTION_READY, DEVICE_TYPE_RS_HUB1 } = require("../../constants");
const { VERSION } = require("../constants");

module.exports.discovery = (rbus) => () => {
  rbus.socket.send(Buffer.from([
    rbus.ready ? ACTION_READY : ACTION_DISCOVERY,
    DEVICE_TYPE_RS_HUB1,
    ...VERSION
  ]));
}