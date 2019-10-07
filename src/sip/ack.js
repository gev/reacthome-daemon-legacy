
const sip = require('sip');
const SDP = require('sdp-transform');
const uuid = require('uuid/v4');
const janus = require('../janus');
const { GENERATE } = require('../janus/constants');
const calls = require('./calls');

module.exports = ({ jsep, session_id, handle_id, call_id }) => {
  janus.sendMessage(session_id, handle_id, { request: GENERATE }, jsep, ({ plugindata }) => {
    if (!plugindata) return;
    if (calls.has(call_id)) {
      const { request } = calls.get(call_id);
      const rs = sip.makeResponse(request, 200, 'Ok');
      // rs.content = plugindata.data.result.sdp;
      const o = SDP.parse(plugindata.data.result.sdp);
      o.media = o.media.filter(media => media.type === 'audio');
      rs.content = SDP.write(o);
      rs.headers.contact = [{ uri: request.headers.to.uri, params: {} }];
      rs.headers.to.params.tag = call_id;
      rs.headers['content-type'] = 'application/sdp';
      rs.headers['content-length'] = rs.content.length;
      sip.send(rs);
    }
  });
};
