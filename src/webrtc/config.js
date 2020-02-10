
module.exports.gateURL = id => `wss://gate.reacthome.net/${id}`;

module.exports.ICE = {
  iceServers: [
    {
      // urls: 'stun:gate.reacthome.net'
      urls: 'stun:stun.l.google.com:19302'
    },
    {
      // urls: 'turns:gate.reacthome.net',
      // username: 'username',
      // credential: 'password'
      urls: 'turn:numb.viagenie.ca',
      username: 'webrtc@live.com',
      credential: 'muazkh'
    }
  ]
};

module.exports.options = {
  offerToReceiveAudio: false,
  offerToReceiveVideo: false
};
