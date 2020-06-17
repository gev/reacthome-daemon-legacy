
const janus = require('../janus');
const { get } = require('../actions');
const { fixSDP } = require('../sdp');
const { send } = require('../websocket/peer');
const { CREATE } = require('../janus/constants');
const { RTSP, WATCH, START } = require('./constants');

const streams = new Map();
let session_id;

janus.createSession((id) => {session_id = id});

module.exports.onWatch = ({ id, preview, audio = false, video = true }, session) => {
  const camera = get(id);
  if (!camera) return;
  const { main_URL, preview_URL } = camera;
  const url = preview ? (preview_URL || main_URL) : main_URL;
  if (!url) return;
  // janus.createSession((session_id) => {
    janus.attachPlugin(session_id, 'janus.plugin.streaming', (handle_id) => {
      const watch = (stream_id) => {
        janus.send(session_id, handle_id, { request: WATCH, id: stream_id }, (data) => {
          // console.log('data', JSON.stringify(data, null, 2));
          const {jsep} = data;
          if (jsep) {
            // jsep.sdp = fixSDP(jsep.sdp);
            // jsep.sdp = jsep.sdp.replace('42801E', '42e01f');
            // jsep.sdp = jsep.sdp.replace('420029', '42e01f');
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
    });
  // });
};

module.exports.onStart = ({ session_id, handle_id, jsep }) => {
  console.log(jsep);
  janus.send(session_id, handle_id, { request: START }, jsep, (data) => {
    console.log('data', JSON.stringify(data, null, 2));
  });
};
