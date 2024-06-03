const WebSocket = require("ws");
const { isUUID } = require("../uuid");
const { deleteSession } = require("../notification");
const { peers } = require("./peer");
const handle = require("./handle");
const { terminals } = require("../terminal");

const PROTOCOL = "listen";
const TIMEOUT = 1000;
const gateURL = (id) => `wss://gate.reacthome.net/${id}`;

let t;
const sessions = new Set();

const connect = (id) => {
  const socket = new WebSocket(gateURL(id), PROTOCOL);
  socket.on("message", (data) => {
    const session = data.substring(0, 36);
    if (!isUUID.test(session)) return;
    const message = data.substring(36);
    if (message) {
      if (!sessions.has(session)) {
        sessions.add(session);
        peers.set(session, {
          session,
          online: true,
          state: "active",
          timestamp: Date.now(),
          send(message, cb) {
            socket.send(`${session}${JSON.stringify(message)}`, cb);
          },
        });
      }
      handle(session, message);
    } else {
      deleteSession(session);
      sessions.delete(session);
      peers.delete(session);
      terminals.delete(session);
    }
  });
  socket.on("close", () => {
    for (const session of sessions) {
      deleteSession(session);
      sessions.delete(session);
      peers.delete(session);
      terminals.delete(session);
    }
    setTimeout(connect, TIMEOUT, id);
  });
  socket.on("open", () => {
    clearInterval(t);
    t = setInterval(() => {
      socket.ping();
    }, 10 * TIMEOUT);
  });
  socket.on("error", console.error);
};

module.exports = connect;
