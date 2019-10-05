
const sip = require('sip');
const SDP = require('sdp-transform');
const uuid = require('uuid/v4');
const janus = require('../janus');
const { GENERATE } = require('../janus/constants');
const calls = require('./calls');

const tag = '123456';

module.exports = (action) => {
  const { jsep, session_id, handle_id, call_id } = action;
  janus.sendMessage(session_id, handle_id, { request: GENERATE }, jsep, ({ plugindata }) => {
    if (!plugindata) return;
    const request = calls.get(call_id);
    if (!request) return;
    const rs = sip.makeResponse(request, 200, 'Ok');
    // rs.content = plugindata.data.result.sdp;
    const o = SDP.parse(plugindata.data.result.sdp);
    o.media = o.media.filter(media => media.type === 'audio');
    rs.content = SDP.write(o);
    rs.content = rs.content.replace('2 IN IP4 1.1.1.1', '0 IN IP4 192.168.88.188').replace('s=-', 's=Reacthome').replace('o=-', 'o=0');
    rs.headers.contact = request.headers.to;
    rs.headers.contact.params = {};
    rs.headers.to.params.tag = tag;
    rs.headers['content-type'] = 'application/sdp';
    rs.headers['content-length'] = rs.content.length;
    console.log(JSON.stringify(rs, null, 2));
    sip.send(rs);
  });
};
