
const sip = require('sip');
const calls = require('./calls');
const janus = require('../janus');
const { broadcastAction } = require('../webrtc/peer');
const { BYE, HANGUP } = require('./constants');

module.exports = ({ call_id }) => {
  if (calls.has(call_id)) {
    const { session_id, handle_id, request } = calls.get(call_id);
    const rq = {
      method: 'BYE',
      uri: request.headers.contact[0].uri,
      headers: {
          to: request.headers.from,
          from: request.headers.to,
          'call-id': call_id,
          cseq: { method: BYE, seq: 2000 },
          via: []
      }
    };
    sip.send(rq);
    broadcastAction({ type: BYE, call_id });
    janus.sendMessage(session_id, handle_id, { request: HANGUP })
    calls.delete(call_id);
  }
};
