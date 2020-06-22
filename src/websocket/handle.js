
const { GET, LIST } = require('../init/constants');
const { ACK, BYE, CANCEL } = require('../sip/constants');
const { START, WATCH } = require('../camera/constants');
const { POOL } = require('../constants');
const { run } = require('../controllers/service');
const { onWatch, onStart } = require('../camera');
const { TOKEN } = require('../notification/constants');
const { addToken } = require('../notification');
const { broadcast } = require('./peer');
const onGet = require('../init/get');
const onList = require('../init/list');
const onAck = require('../sip/ack');
const onBye = require('../sip/bye');
const { PTY } = require('../terminal/constants');
const onPTY = require('../terminal');
const janus = require('../janus');

module.exports = (session, message) => {
  try {
    const action = JSON.parse(message);
    switch (action.type) {
      case LIST: {
        onList(session);
        break;
      }
      case TOKEN: {
        addToken(action, session);
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
      case PTY: {
        onPTY(action, session);
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
