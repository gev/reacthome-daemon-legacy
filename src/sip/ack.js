
const sip = require('sip');
const janus = require('../janus');
const { GENERATE } = require('../janus/constants');
const calls = require('./calls');

module.exports = async (action) => {
  try {
    const { id, payload } = payload;
    const { jsep, session_id, handle_id, call_id } = payload;
    const { plugindata } = await janus.sendMessage(session_id, handle_id, { request: GENERATE }, jsep);
    if (!plugindata) return;
    const request = calls.get(call_id);
    if (!request) return;
    const rs = sip.makeResponse(request, 200, 'Ok');
    rs.content = plugindata.data.result.sdp;
    rs.headers['content-type'] = 'application/sdp';
    rs.headers['content-length'] = rs.content.length;
    sip.send(rs);
  } catch (e) {
    console.error(e);
  }
};
