
const janus = require('../janus');
const { get } = require('../actions');
const { fixSDP } = require('../util');
const { sendAction } = require('../webrtc/peer');
const { CREATE } = require('../janus/constants');
const { RTSP, WATCH, START } = require('./constants');

module.exports.onWatch = ({ id, preview, audio = false, video = true }, session) => {
  const camera = get(id);
  if (!camera) return;
  const { main_URL, preview_URL } = camera;
  const url = preview ? (preview_URL || main_URL) : main_URL;
  if (!url) return;
  janus.createSession((session_id) => {
    janus.attachPlugin(session_id, 'janus.plugin.streaming', (handle_id) => {
      const u = new URL(url);
      const rtsp_user = u.username;
      const rtsp_pwd = u.password;
      u.username = '';
      u.password = '';
      janus.sendMessage(session_id, handle_id, {
        request: CREATE,
        type: RTSP,
        audio, video,
        url: u.toString(),
        rtsp_user, rtsp_pwd
      }, ({ plugindata }) => {
        const stream_id = plugindata.data.stream.id;
        janus.sendMessage(session_id, handle_id, { request: WATCH, id: stream_id }, ({ jsep }) => {
          if (jsep) {
            // jsep.sdp = fixSDP(jsep.sdp);
            jsep.sdp = jsep.sdp.replace('42801E', '42e01f');
            sendAction(session, { type: WATCH, id, session_id, handle_id, stream_id, jsep });
          }
        });
      });
    });
  });
};

module.exports.onStart = ({ session_id, handle_id, stream_id, jsep }, session) => {
  janus.sendMessage(session_id, handle_id, jsep, { request: START, id: stream_id });
};
