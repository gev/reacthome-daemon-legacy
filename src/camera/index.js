
const janus = require('../janus');
const { get } = require('../actions');
const { fixSDP } = require('../sdp');
const { send } = require('../websocket/peer');
const { CREATE } = require('../janus/constants');
const { RTSP, WATCH, START } = require('./constants');

const streams = new Map();

module.exports.onWatch = ({ id, preview, audio = false, video = true }, session) => {
  const camera = get(id);
  if (!camera) return;
  const { main_URL, preview_URL } = camera;
  const url = preview ? (preview_URL || main_URL) : main_URL;
  if (!url) return;
  console.log('########################################');
  console.log(id)
  janus.createSession((session_id) => {
    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
    console.log(session_id)
    janus.attachPlugin(session_id, 'janus.plugin.streaming', (handle_id) => {
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
      console.log(handle_id)
      const watch = (stream_id) => {
        console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
        console.log(stream_id)
        janus.send(session_id, handle_id, { request: WATCH, id: stream_id }, ({ jsep }) => {
          console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        if (jsep) {
            jsep.sdp = fixSDP(jsep.sdp);
            // jsep.sdp = jsep.sdp.replace('42801E', '42e01f');
            // jsep.sdp = jsep.sdp.replace('420029', '42e01f');
            console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
            console.log(jsep);
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
          console.log('*************************************************')
          console.log(plugindata);
          const stream_id = plugindata.data.stream.id;
          streams.set(url, stream_id);
          watch(stream_id);
        });
      }
    });
  });
};

module.exports.onStart = ({ session_id, handle_id, stream_id, jsep }, session) => {
  janus.send(session_id, handle_id, { request: START, id: stream_id }, jsep);
};
