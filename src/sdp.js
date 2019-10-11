
const SDP = require('sdp-transform');

module.exports.isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

module.exports.fixSDP = (sdp) => {
  const o = SDP.parse(sdp);
  for (let media of o.media) {
    if (media.type === 'video') {
      media.fmtp = [{
        payload: 96,
        config: 'level-asymmetry-allowed=1;profile-level-id=42e01f;packetization-mode=1'
      }];
    }
  }
  return SDP.write(o);
}