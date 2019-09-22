
module.exports.gateURL = id => `wss://gate.reacthome.net/${id}`;
// module.exports.gateURL = id => `ws://gate.reacthome.net:3000/${id}`;

module.exports.ICE = {
  iceServers: [
    {
      urls: 'stun:gate.reacthome.net'
    },
    {
      urls: 'turns:gate.reacthome.net',
      username: 'username',
      credential: 'password'
    }
  ]
};

module.exports.options = {
  offerToReceiveAudio: false,
  offerToReceiveVideo: false
};
