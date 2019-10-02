
const WebSocket = require('ws');

const socket = new WebSocket('ws://localhost:8188', 'janus-protocol');

socket.onerror(console.error);


socket.on('message', (message) => {
  console.log(message);
  try {
    const data = JSON.parse(message);
    if (data.transaction) {
      const callback = callbacks.get(data.transaction);
      if (callback) {
        // callbacks.delete(data.transaction);
        callback(data);
      }
    } else if (data.janus === 'trickle') {

    }
  } catch (e) {
    console.log(e);
  }
});
