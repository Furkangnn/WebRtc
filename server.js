const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");
const cors = require("cors");

app.set("view engine", "ejs");
app.use(express.static("public"));

// Configure CORS to allow requests from localhost
app.use(
  cors({
    origin: "*", // Bu IP adresini ekleyin, // Allow requests from this origin
  })
);

app.get("/", (req, res) => {
  const roomId = uuidV4();
  res.redirect(`/${roomId}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user_connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user_disconnected", userId);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
