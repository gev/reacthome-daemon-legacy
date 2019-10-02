
const sip = require('sip');
const janus = require('../janus');
const { broadcastAction } = require('../webrtc');
const { OFFER } = require('../webrtc/constants');
const { INVITE } = require('./constants');
const calls = require('./calls');

module.exports.onRegister = (request) => {
  const rs = sip.makeResponse(request, 200, 'Ok');
  // rs.headers.to.tag = uuid.v4();
  sip.send(rs);
};

module.exports.onInvite = async (request) => {
  const call_id = calls.create(request);
  sip.send(sip.makeResponse(request, 100, 'Ok'));
  sip.send(sip.makeResponse(request, 180, 'Ok'));
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
