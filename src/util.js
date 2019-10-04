
const SDP = require('sip/sdp');

module.exports.isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const fixProfile = s => {
  const t = s.split('=');
  return t[0] === 'profile-level-id' ? 'profile-level-id=42e01f' : s;
};

module.exports.fixSDP = (sdp) => {
  console.log(sdp);
  const o = SDP.parse(sdp);
  for (let m of o.m) {
    if (m.media === 'video') {
      m.a = m.a.map (a => a.split(';').map(fixProfile).join(';'));
      // m.a = [
      //   'rtpmap:96 H264/90000',
      //   'rtcp-fb:96 nack',
      //   'rtcp-fb:96 nack pli',
      //   'fmtp:96 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f'
      // ]
    }
  }
  console.log(SDP.stringify(o));
  return SDP.stringify(o);
}