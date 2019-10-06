
const sip = require('sip');
const SDP = require('sdp-transform');
const uuid = require('uuid/v4');
const janus = require('../janus');
const { fixSDP } = require('../util');
const { peers, sendAction } = require('../webrtc');
const { PROCESS } = require('../janus/constants');
const { OFFER } = require('../webrtc/constants');
const { INVITE } = require('./constants');
const calls = require('./calls');

const realm = 'reacthome';
const tag = '123456';

module.exports.onRegister = (request) => {
  let rs;
    rs = sip.makeResponse(request, 200, 'Ok');
    rs.headers.contact = [{ uri: request.headers.contact[0].uri, expires: 3600 }];
    rs.headers.to.params.tag = uuid();
  sip.send(rs);
};

const rs100 = (call_id, request) => {
  const rs = sip.makeResponse(request, 100, 'Ok');
  rs.headers.to.params.tag = call_id;
  return rs;
}

const rs180 = (call_id, request) => {
  const rs = sip.makeResponse(request, 180, 'Ok');
  rs.headers.contact = [{ uri: request.headers.to.uri, params: {} }];
  rs.headers.to.params.tag = call_id;
  return rs;
}

module.exports.onInvite = (request) => {
  const call_id = calls.create(request);
  sip.send(rs100(call_id, request));
  sip.send(rs180(call_id, request));
  for (let session of peers.keys()) {
    janus.createSession((session_id) => {
      janus.attachPlugin(session_id, 'janus.plugin.nosip', (handle_id) => {
        const o = SDP.parse(request.content);
        o.media = o.media.filter(media => media.type === 'audio');
        janus.sendMessage(session_id, handle_id, {
          request: PROCESS,
          type: OFFER,
          sdp: SDP.write(o)
        }, ({ jsep }) => {
          if (jsep) {
            // jsep.sdp = fixSDP(jsep.sdp);
            const o = SDP.parse(jsep.sdp);
            o.media = o.media.filter(media => media.type === 'audio');
            jsep.sdp = SDP.write(o);
            sendAction(session, { type: INVITE, jsep, session_id, handle_id, call_id });
          }
        });
      });
    });
  }
};
