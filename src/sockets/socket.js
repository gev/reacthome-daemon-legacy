
const { createSocket } = require('dgram');

module.exports = (discovery, interval, port, listen) => {

  const timer = {};
  const queue = {};
  
  const socket = createSocket('udp4');
  
  const send = (packet, ip) => {
    if (!timer[ip]) {
      q = [];
      queue[ip] = q;
      console.log('create ', ip);
      timer[ip] = setInterval(() => {
        if (q.length === 0) return;
        console.log(ip, q.length);
        socket.send(q.shift(), port, ip, (err) => {
          if (err) console.error(error);
        });
      }, 50);
    }
    console.log('push ', ip);
    queue[ip].push(packet);
    // socket.send(packet, port, ip, (err) => {
    //   if (err) console.error(error);
    // });
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
