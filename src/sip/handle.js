
const sip = require('sip');
const digest = require('sip/digest');
const uuid = require('uuid/v4');
const janus = require('../janus');
const { fixSDP } = require('../util');
const { broadcastAction } = require('../webrtc');
const { PROCESS } = require('../janus/constants');
const { OFFER } = require('../webrtc/constants');
const { INVITE } = require('./constants');
const calls = require('./calls');

const realm = 'reacthome';
const tag = '123456';

module.exports.onRegister = (request) => {
  let rs;
  // if (request.headers.authorization) {
    rs = sip.makeResponse(request, 200, 'Ok');
    rs.headers.contact = request.headers.contact;
    rs.headers.to.tag = uuid();
  // } else {
  //   rs = digest.challenge({ realm }, sip.makeResponse(request, 401, 'Authentication Required'));
  // }
  console.log(JSON.stringify(rs, null, 2));
  sip.send(rs);
};

module.exports.onInvite = (request) => {
  const call_id = calls.create(request);
  let rs;
  // rs = sip.makeResponse(request, 100, 'Ok');
  // rs.headers.contact = request.headers.to;
  // rs.headers.to.tag = tag;
  // sip.send(rs);
  rs = sip.makeResponse(request, 180, 'Ok');
  rs.headers.contact = request.headers.to;
  rs.headers.to.tag = tag;
  sip.send(rs);
  janus.createSession((session_id) => {
    janus.attachPlugin(session_id, 'janus.plugin.nosip', (handle_id) => {
      janus.sendMessage(session_id, handle_id, {
        request: PROCESS,
        type: OFFER,
        sdp: request.content
      }, ({ jsep }) => {
        if (jsep) {
          jsep.sdp = fixSDP(jsep.sdp);
          broadcastAction({ type: INVITE, jsep, session_id, handle_id, call_id });
        }
      });
    });
  });
};
