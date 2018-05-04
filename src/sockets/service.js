
const {
  mac,
  version,
  DAEMON,
  DISCOVERY_INTERVAL,
  ACTION_DISCOVERY,
  SERVICE_GROUP,
  SERVICE_PORT,
} = require('../constants');
const socket = require('./socket');

module.exports = socket(
  () => JSON.stringify({
    id: mac,
    type: ACTION_DISCOVERY,
    payload: { type: DAEMON, version }
  }),
  DISCOVERY_INTERVAL, SERVICE_PORT, SERVICE_GROUP
);
