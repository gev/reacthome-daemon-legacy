
const sip = require('sip');
const uuid = require('uuid/v4');
const janus = require('../janus');
const { fixSDP } = require('../util');
const { broadcastAction } = require('../webrtc');
const { PROCESS } = require('../janus/constants');
const { OFFER } = require('../webrtc/constants');
const { INVITE } = require('./constants');
const calls = require('./calls');

module.exports.onRegister = (request) => {
  const rs = sip.makeResponse(request, 200, 'Ok');
  rs.headers.to.tag = uuid();
  sip.send(rs);
};

module.exports.onInvite = (request) => {
  const call_id = calls.create(request);
  sip.send(sip.makeResponse(request, 100, 'Ok'));
  sip.send(sip.makeResponse(request, 180, 'Ok'));
  janus.createSession((session_id) => {
    janus.attachPlugin(session_id, 'janus.plugin.nosip', (handle_id) => {
      janus.sendMessage(session_id, handle_id, {
        request: PROCESS,
        type: OFFER,
        sdp: request.content
      }, ({ jsep }) => {
        if (jsep) {
          console.log(jsep);
          broadcastAction({ type: INVITE, jsep, session_id, handle_id, call_id });
        }
      });
    });
  });
};
