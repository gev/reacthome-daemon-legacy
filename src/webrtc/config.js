
module.exports.gateURL = id => `wss://gate.reacthome.net/${id}`;

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
