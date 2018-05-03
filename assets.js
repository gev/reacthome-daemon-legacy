
const Koa = require('koa');
const static = require('koa-static');
const { mac, SERVICE_PORT, IMAGE } = require('./src/constants');

const app = new Koa();
app.use(static('./tmp/assets/'));
app.listen(SERVICE_PORT);
