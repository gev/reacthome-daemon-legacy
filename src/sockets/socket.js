
const { createSocket } = require('dgram');

module.exports = (discovery, interval, port, listen, hasQueue) => {

  const timer = {};
  const queue = {};
  const timestamp = {};
  
  const socket = createSocket('udp4');

  const send = hasQueue
    ? (packet, ip) => {
      if (!timer[ip]) {
        queue[ip] = [];
        timestamp[ip] = Date.now();
        timer[ip] = setInterval(() => {
          if (queue[ip].length === 0) return;
          timestamp[ip] = Date.now();
          socket.send(queue[ip].shift(), port, ip, (err) => {
            if (err) console.error(error);
          });
        }, 20);
      } else {
        if (queue[ip].length === 0) {
          const now = Date.now();
          if (now - timestamp[ip] > 20) {
            timestamp[ip] = now;
            socket.send(packet, port, ip, (err) => {
              if (err) console.error(error);
            });
          } else {
            queue[ip].push(packet);
          }
        } else {
          queue[ip].push(packet);
        }
        console.log(ip, queue[ip].length);
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
