
const { createSocket } = require('dgram');

module.exports = (discovery, interval, port, listen) => {

  const socket = createSocket('udp4');

  const queue = [];

  setInterval(() => {
    if (queue.length === 0) return;
    const { packet, ip } = queue.shift();
    socket.send(packet, port, ip, (err) => {
      if (err) console.error(error);
    });
  }, 1);
  
  const send = (packet, ip) => {
    queue.push({ packet, ip });
  };
  
  const sendConfirm = (packet, ip, confirm, t = 1000) => {
    if (confirm()) return;
    send(packet, ip);
    setTimeout(sendConfirm, t, packet, ip, confirm, t);
  };
  
  socket
    .on('error', console.error)
    .bind(listen, () => {
      setInterval(discovery(socket), interval);
    });
  
    const handle = (handler) => {
      socket.on('message', handler)
    };  
    
    return { handle, send, sendConfirm };
};
