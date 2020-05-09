
const { GET } = require('../init/constants');
const { ACK, BYE, CANCEL } = require('../sip/constants');
const { START, WATCH } = require('../camera/constants');
const { POOL } = require('../constants');
const { run } = require('../controllers/service');
const { onWatch, onStart } = require('../camera');
const { TOKEN } = require('../notification/constants');
const { add } = require('../actions');
const { broadcast, send } = require('./peer');
const onGet = require('../init/get');
const onAck = require('../sip/ack');
const onBye = require('../sip/bye');
const janus = require('../janus');

const pong = {type: PONG};

module.exports = (message) => {
  try {
    const action = JSON.parse(message);
    switch (action.type) {
      case PING: {
        send(session, pong);
        break;
      }
      case TOKEN: {
        add(TOKEN, POOL, action.token);
        break;
      }
      case GET: {
        onGet(action, session);
        break;
      }
      case ACK: {
        onAck(action, session);
        break;
      }
      case BYE: {
        onBye(action, session);
        break;
      }
      case WATCH: {
        onWatch(action, session);
        break;
      }
      case START: {
        onStart(action);
        break;
      }
      case 'candidate': {
        janus.trickle(action);
        break;
      }
      case 'navigate': {
        broadcast(action);
        break;
      }
      default: {
        run(action);
      }
    }
  } catch(e) {
    console.error(e);
  }
};
