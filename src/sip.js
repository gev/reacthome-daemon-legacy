
const uuid = require('uuid');
const digest = require('sip/digest');
const sip = require('sip');
const janus = require('./janus')
const { broadcastAction } = require('./webrtc');

const calls = {};
const callbacks = new Map();

// gate.on('message', (message) => {
//   console.log(message);
//   try {
//     const { action, id, payload } = JSON.parse(message);
//     switch (action) {
//       case 'answer': {
//         const { jsep, session_id, handle_id, call_id } = payload;
//         sendToJanus({
//           janus: 'message',
//           session_id,
//           handle_id,
//           jsep,
//           body: {
//             request: 'generate'
//           }
//         }, ({ plugindata }) => {
//           if (!plugindata) return;
//           const rs = sip.makeResponse(calls[call_id], 200, 'Ok');
//           rs.content = plugindata.data.result.sdp;
//           rs.headers['content-type'] = 'application/sdp';
//           rs.headers['content-length'] = rs.content.length;
//           sip.send(rs);
//         });
//         break;
//       }
//       case 'icecandidate': {
//         const { candidate, session_id, handle_id } = payload;
//         sendToJanus({
//           janus: 'trickle',
//           session_id,
//           handle_id,
//           candidates: [candidate]
//         });
//         break;
//       }
//     }
//   } catch (e) {

//   }
// });

const call = (request) => {
  const call_id = uuid.v4();
  calls[call_id] = request;
  [100, 180].forEach(code => {
    const rs = sip.makeResponse(request, code, 'Ok');
    sip.send(rs);
  });
  sendToJanus({ janus: 'create' }, ({ data }) => {
    const session_id = data.id;
    sendToJanus({
      janus: 'attach',
      session_id,
      plugin: 'janus.plugin.nosip'
    }, ({ data }) => {
      const handle_id = data.id;
      sendToJanus({
        janus: 'message',
        session_id,
        handle_id,
        body: {
          request: 'process',
          type: 'offer',
          sdp: request.content
        }
      }, ({ jsep }) => {
        if (!jsep) return;
        sendToGate('offer', { jsep, session_id, handle_id, call_id });
      });
    })
  });
};

let session_id;

const options = {
  logger: {
    error: console.error
  }
};

module.exports.start = () => {
  sip.start(options, (request, info) => {
    console.log(request);
    switch(request.method) {
      case 'REGISTER': {
        const rs = sip.makeResponse(request, 200, 'Ok');
        sip.send(rs);
        break;
      }
      case 'INVITE': {
        call(request);
        break;
      }
    }
  });

};
