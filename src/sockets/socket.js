
const { createSocket } = require('dgram');

module.exports = (discovery, interval, port, listen, hasQueue) => {

  const timer = {};
  const queue = {};
  
  const socket = createSocket('udp4');

  const send = hasQueue
    ? (packet, ip) => {
    if (!timer[ip]) {
      q = [];
      queue[ip] = q;
      pause = false;
      timer[ip] = setInterval(() => {
        if (pause || q.length === 0) return;
        pause = true;
        socket.send(q.shift(), port, ip, (err) => {
          if (err) console.error(error);
          pause = false
        });
      }, 20);
    }
    queue[ip].push(packet);
  }
  : (packet, ip) => {
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
