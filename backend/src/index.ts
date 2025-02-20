import express, { Request, Response } from "express";
import cookieParser from "cookie-parser"
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { setupSocket } from "./config/socket";
import { authenticateUser } from "./middlewares/privyAuthMiddleware";
import chatController from "./controllers/chatController"
import userController from "./controllers/userController";
import circleController from "./controllers/circleController";

dotenv.config();
mongoose.connect(process.env.MONGO_URI || "");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

setupSocket(io);

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/chat", authenticateUser, chatController)
app.use("/api/user", authenticateUser, userController)
app.use("/api/circle", circleController)

app.get("/api/test", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Test route",
  });
})

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});