
const SerialPort = require('serialport');
const EventEmitter = require('events');
const crc = require('crc').crc16modbus;

module.exports = class extends EventEmitter {

    constructor({address = 0x46, device, delay = 200, period = 15000}) {

        super();


        const connect = (cb) => {
            const port = new SerialPort(device, {
                baudRate: 9600,
                dataBits: 8,
                parity: 'none',
                stopBits: 1,
                autoOpen: true
            });
            port
                .on('open', cb)
                .on('data', process)
                .on('error', err => {this.emit('error', err)});
            return port;
        };


        const login = () => {
            send([1, 1, 1, 1, 1, 1, 1, 1]);
        };

        const request = () => {
            send([5, 0, 6]);
        };

        let t;
        let pool = [];
        const process = data => {
            clearTimeout(t);
            pool.push(data);
            t = setTimeout(() => {
                const buff = Buffer.concat(pool);
                pool = [];
                if (buff.length === 4)
                    if (buff.readUInt8(1) === 5)
                        login();
                    else
                        request();
                else if (buff.length === 99) {
                    const t = [];
                    for (let i = 0; i < 6; i++)
                        t[i] = (buff.readUInt16LE(i * 16 + 1) << 16) | buff.readUInt16LE(i * 16 + 3);
                    this.emit('data', t);
                    setTimeout(request, period)
                }
            }, delay);
        };

        let socket = connect(request);

        const send = cmd => {
            socket.write(query(cmd), err => {
                if (err) this.emit('error', err);
            })
        };

        const query = cmd => {
            const buff = Buffer.alloc(1 + cmd.length);
            buff.writeUInt8(address & 0xff, 0);
            cmd.forEach((b, i) => {buff.writeUInt8(b, i + 1)});
            const req = Buffer.alloc(buff.length + 2, buff);
            req.writeUInt16LE(crc(buff), buff.length);
            return req
        };



    }


};
