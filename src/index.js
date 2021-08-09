const path = require("path");
const http = require("http");
const express = require("express");
const Filter = require("bad-words");
const socketio = require("socket.io");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;
const publicDirectories = path.join(__dirname, "../public");

app.use(express.static(publicDirectories));

io.on("connection", (socket) => {
  console.log("New connection");
  socket.emit("message", generateMessage("Welcome!"));
  socket.broadcast.emit("message", generateMessage("A new user joined!!"));
  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    io.emit("message", generateMessage(message));
    callback();
  });
  socket.on("sendLocation", ({ latitude, longitude }, callback) => {
    io.emit("locationMessage", generateLocationMessage(latitude, longitude));
    callback();
  });
  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left"));
  });
});

server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
