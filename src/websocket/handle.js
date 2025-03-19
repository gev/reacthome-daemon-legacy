
const { GET, LIST } = require('../init/constants');
const { ACK, BYE, INFO } = require('../sip/constants');
const { START, STOP, WATCH, PAUSE } = require('../camera/constants');
const { run } = require('../controllers/service');
const { onWatch, onStart, onStop, onPause } = require('../camera');
const { TOKEN } = require('../notification/constants');
const { addToken } = require('../notification');
const { broadcast, peers } = require('./peer');
const onGet = require('../init/get');
const onList = require('../init/list');
const onAck = require('../sip/ack');
const onBye = require('../sip/bye');
const onInfo = require('../sip/info');
const { PTY } = require('../terminal/constants');
const onPTY = require('../terminal');
const janus = require('../janus');
const { CANDIDATE, KEEPALIVE } = require('../janus/constants');
const { ACTION_ASSIST } = require('../constants');

module.exports = (session, message) => {
  try {
    const peer = peers.get(session);
    peer.timestamp = Date.now();
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
        if (action.call_id) {
          onAck(action, session);
        } else {
          broadcast(action, session);
        }
        break;
      }
      case BYE: {
        if (action.call_id) {
          onBye(action, session);
        } else {
          broadcast(action, session);
        }
        break;
      }
      case INFO: {
        onInfo(action);
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
      case STOP: {
        onStop(action);
        break;
      }
      case PAUSE: {
        onPause(action);
        break;
      }
      case KEEPALIVE: {
        janus.keepalive(action);
        break;
      }
      case CANDIDATE: {
        janus.trickle(action);
        break;
      }
      case PTY: {
        onPTY(action, session);
        break;
      }
      case 'navigate': {
        broadcast(action);
        break;
      }
      case 'state': {
        peer.state = action.value;
        break;
      }
      case ACTION_ASSIST: {
        console.log(action);
        action.payload.message = "поберегись";
        peer.send(action)
        break;
      }
      default: {
        run(action);
      }
    }
  } catch (e) {
    console.error(e);
  }
};
