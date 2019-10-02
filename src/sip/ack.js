
module.exports = (action) => {
  const { id, payload } = payload;
  switch (action) {
    case 'answer': {
      const { jsep, session_id, handle_id, call_id } = payload;
      sendToJanus({
        janus: 'message',
        session_id,
        handle_id,
        jsep,
        body: {
          request: 'generate'
        }
      }, ({ plugindata }) => {
        if (!plugindata) return;
        const rs = sip.makeResponse(calls[call_id], 200, 'Ok');
        rs.content = plugindata.data.result.sdp;
        rs.headers['content-type'] = 'application/sdp';
        rs.headers['content-length'] = rs.content.length;
        sip.send(rs);
      });
      break;
    }
    case 'icecandidate': {
      const { candidate, session_id, handle_id } = payload;
      sendToJanus({
        janus: 'trickle',
        session_id,
        handle_id,
        candidates: [candidate]
      });
      break;
    }
  }
} catch (e) {

}
});
