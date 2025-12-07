const { Server } = require("ws");
const uuid = require("uuid").v4;
const { deleteSession } = require("../notification");
const { peers } = require("./peer");
const handle = require("./handle");
const { terminals } = require("../terminal");

const port = 3000;

module.exports = () => {
  const server = new Server({ port });
  server.on("connection", (socket, req) => {
    const session = uuid();
    const clientIP = req.socket.remoteAddress || req.headers["x-forwarded-for"] || "unknown";
    console.log("[WebSocket] Новое подключение:", session, "IP:", clientIP);
    
    socket.on("close", (code, reason) => {
      console.log("[WebSocket] Соединение закрыто:", session, "код:", code, "причина:", reason ? reason.toString() : "нет");
      peers.delete(session);
      deleteSession(session);
    });
    
    socket.on("error", (error) => {
      console.error("[WebSocket] Ошибка соединения", session + ":", error.message || error);
    });
    
    socket.on("message", (message) => {
      handle(session, message);
    });
    peers.set(session, {
      session,
      online: true,
      state: "active",
      timestamp: Date.now(),
      send(message, cb) {
        socket.send(JSON.stringify(message), cb);
      },
    });
  });
};
