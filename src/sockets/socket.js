
const { createSocket } = require('dgram');

module.exports = (discovery, interval, port, group, listen ) => {

  const socket = createSocket('udp4');
  
  const send = (packet, ip) => {
    socket.send(packet, port, ip);
  };
  
  const sendConfirm = (packet, ip, confirm, t = 1000) => {
    if (confirm()) return;
    send(packet, ip);
    setTimeout(sendConfirm, t, packet, ip, confirm, t);
  };
  
  socket
    .on('error', console.error)
    .bind(listen, () => {
      const data = discovery(socket);
      setInterval(send, interval, data, group);
    });
  
    const handle = (handler) => {
      socket.on('message', handler)
    };  
    
    return { handle, send, sendConfirm };
};
