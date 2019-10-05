
const SDP = require('sdp-transform');
const sip = require('sip');
const janus = require('../janus');
const { GENERATE } = require('../janus/constants');
const calls = require('./calls');

module.exports = (action) => {
  const { jsep, session_id, handle_id, call_id } = action;
  janus.sendMessage(session_id, handle_id, { request: GENERATE }, jsep, ({ plugindata }) => {
    if (!plugindata) return;
    const request = calls.get(call_id);
    if (!request) return;
    const rs = sip.makeResponse(request, 200, 'Ok');
    // const o = SDP.parse(plugindata.data.result.sdp);
    // o.media = o.media.filter(media => media.type === 'audio');
    // rs.content = SDP.write(o);
    rs.headers.via = [];
    rs.headers.contact = request.headers.contact;
    rs.content = plugindata.data.result.sdp;
    rs.headers['content-type'] = 'application/sdp';
    rs.headers['content-length'] = rs.content.length;
    console.log(JSON.stringify(rs, null, 2));
    sip.send(rs);
  });
};
