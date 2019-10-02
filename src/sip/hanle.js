
const sip = require('sip');
const uuid = require('uuid');
const janus = require('../janus')
const { broadcastAction } = require('../webrtc');
const { OFFER } = require('../webrtc/constants');
const { INVITE } = require('./constants');

const calls = new Map();

const register = () => {

}

const invite = (request) => {
  const call_id = uuid();
  calls.set(call_id, request);
  sip.send(sip.makeResponse('request', 100, 'Ok'));
  sip.send(sip.makeResponse('request', 180, 'Ok'));
  try {
    const session = await janus.createSession();
    const handle = await janus.attachPlugin(session, 'janus.plugin.nosip');
    const { jsep } = await janus.sendMessage(session, handle, {
      request: 'process', type: 'offer', sdp: request.connect
    });
    if (jsep) {
      broadcastAction({ type: 'invite', jsep, session_id, handle_id, call_id });
    }
  } catch (e) {
    console.error(e);
  }
};

let session_id;

const options = {
  logger: {
    error: console.error
  }
};
