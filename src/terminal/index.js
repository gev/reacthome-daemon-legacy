
const os = require('os');
const terminal = require('node-pty');
const {send} = require('../websocket/peer');
const { PTY } = require('./constants');

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

const terminals = new Map();

const getPTY = (session) => {
  if (terminals.has(session)) {
    return terminals.get(session);
  }
  const pty = terminal.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env
  });
  pty.on('data', (chunk) => {
    send(session, {type: PTY, chunk});
  });
  terminals.set(session, pty);
  return pty;
}

module.exports = (action, session) => {
  getPTY(session).write(action.chunk);
};