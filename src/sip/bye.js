
const sip = require('sip');
const calls = require('./calls');
const { BYE } = require('./constants');

module.exports = ({ call_id }) => {
  if (calls.has(call_id)) {
    const request = calls.get(call_id)
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
    calls.delete(call_id);
  }
};
