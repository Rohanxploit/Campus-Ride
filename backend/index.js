require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const rideSocket = require("./src/sockets/rideSocket");
const authRoutes = require("./src/routes/authRoutes");
const rideRoutes = require("./src/routes/rideRoutes");
const userRoutes = require("./src/routes/userRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cors());
app.use(express.json());

// Set up routes
app.use("/api/auth", authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Campus Mobility API is running...");
});

// Initialize WebSockets
rideSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
