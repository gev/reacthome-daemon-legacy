
const { createSocket } = require('dgram');

module.exports = (discovery, interval, port, listen, multicast, hasQueue, delay = 100) => {

  const timer = {};
  const queue = {};
  const timestamp = {};

  const socket = createSocket('udp4');

  const send = (packet, ip) => {
    socket.send(packet, port, ip, (err) => {
      if (err) console.error(err);
    });
  };

  // const send = hasQueue
  //   ? (packet, ip) => {
  //     if (!timer[ip]) {
  //       queue[ip] = [];
  //       timestamp[ip] = Date.now();
  //       timer[ip] = setInterval(() => {
  //         const q = queue[ip];
  //         if (q.length === 0) return;
  //         const now = Date.now();
  //         if (now - timestamp[ip] < delay) return;
  //         timestamp[ip] = now;
  //         _send(q.shift(), ip);
  //       }, 1);
  //     } else {
  //       const q = queue[ip];
  //       if (q.length === 0) {
  //         const now = Date.now();
  //         if (now - timestamp[ip] > delay) {
  //           timestamp[ip] = now;
  //           _send(packet, ip);
  //         } else {
  //           q.push(packet);
  //         }
  //       } else {
  //         q.push(packet);
  //       }
  //     }
  //   }
  //   : _send;

  // const sendConfirm = (packet, ip, confirm, t = 1000) => {
  //   if (confirm()) return;
  //   send(packet, ip);
  //   setTimeout(sendConfirm, t, packet, ip, confirm, t);
  // };

  socket
    .on('error', console.error)
    .bind(listen, () => {
      try {
        socket.setMulticastInterface(multicast);
        setInterval(discovery(socket), interval);
      } catch (e) {
        console.error(e)
      }
    });

    const handle = (handler) => {
      socket.on('message', handler);
    };

    return { handle, send };
};
