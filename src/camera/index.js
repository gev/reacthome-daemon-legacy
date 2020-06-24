
const janus = require('../janus');
const { get } = require('../actions');
const { send } = require('../websocket/peer');
const { CREATE } = require('../janus/constants');
const { bind } = require('../janus');
const { RTSP, WATCH, START } = require('./constants');
const { hashCode } = require('../util');
const { streams } = require('./streams');

module.exports.onWatch = ({ id, preview, audio = false, video = true }, session) => {
  const camera = get(id);
  if (!camera) return;
  const { main_URL, preview_URL, } = camera;
  const url = preview ? (preview_URL || main_URL) : main_URL;
  if (!url) return;
  janus.createSession((session_id) => {
    janus.attachPlugin(session_id, 'janus.plugin.streaming', (handle_id) => {
      bind(handle_id, session);
      const watch = (stream_id) => {
        janus.send(session_id, handle_id, { request: WATCH, id: stream_id }, ({jsep}) => {
          if (jsep) {
            send(session, { type: WATCH, id, session_id, handle_id, stream_id, jsep });
          }
        });
      };
      if (streams.has(url)) {
        watch(streams.get(url));
      } else {
        const u = new URL(url);
        const rtsp_user = u.username;
        const rtsp_pwd = u.password;
        u.username = '';
        u.password = '';
          janus.send(session_id, handle_id, {
            request: CREATE,
            id: hashCode(url),
            type: RTSP,
            audio, video,
            url: u.toString(),
            rtsp_user, rtsp_pwd,
            videofmtp: 'profile-level-id=42e01f;packetization-mode=1'
          }, ({ plugindata }) => {
            const stream_id = plugindata.data.stream.id;
            streams.set(url, stream_id);
            watch(stream_id);
          });
      }
    })
  });
};

module.exports.onStart = ({ session_id, handle_id, jsep }) => {
  janus.send(session_id, handle_id, { request: START }, jsep);
};
