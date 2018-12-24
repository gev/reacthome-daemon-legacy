
const { createSocket } = require('dgram');

module.exports = (discovery, interval, port, listen, hasQueue) => {

  const timer = {};
  const queue = {};
  const timestamp = {};
  
  const socket = createSocket('udp4');

  const send = hasQueue
    ? (packet, ip) => {
      const ts = timestamp[ip];
      if (ts) {
        const now = Date.now();
        if (now - ts > 20) {
          timestamp[ip] = now;
          socket.send(packet, port, ip, (err) => {
            if (err) console.error(error);
          });
        } else {
          console.log('waiting', ip);
          setTimeout(send, 20 - now + ts, packet, ip);
        }
      } else {
        timestamp[ip] = Date.now();
        send(packet, ip);
      }
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
