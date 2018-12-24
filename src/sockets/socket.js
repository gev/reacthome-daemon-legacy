
const { createSocket } = require('dgram');

const timer = {};
const queue = {};

module.exports = (discovery, interval, port, listen) => {

  const socket = createSocket('udp4');
  
  const send = (packet, ip) => {
    if (!timer[ip]) {
      q = [];
      queue[ip] = q;
      timer[ip] = setInterval(() => {
        if (q.length === 0) return;
        socket.send(q.shift(), port, ip, (err) => {
          if (err) console.error(error);
        });
      }, 20);
    }
    // queue[ip].push(packet);
    socket.send(packet, port, ip, (err) => {
      if (err) console.error(error);
    });
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
