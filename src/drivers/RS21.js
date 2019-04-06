
var net = require('net');
const { get, set } = require('../actions');

module.exports = class {

  constructor(id) {
    this.id = id;
    this.start();
  }

  start() {
    this.timer = setInterval(() => {
      const { ip } = get(this.id);
      const client = new net.Socket();
      client.on('error', () => {
        set(id, { online: false });
      })
      client.on('data', (data) => {
        const lines = String(data).split('\r\n');
        set(id, {
          online: true,
          temperature: parseFloat(lines[lines.length - 1])
        });
        client.destroy();
      });
      client.connect(80, ip, () => {
        client.write('GET /sensors HTTP/1.1\r\n\r\n');
      });
    }, 1000);
  }

  stop() {
    clearInterval(this.timer);
  }

}
