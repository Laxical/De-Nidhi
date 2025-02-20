import express, { Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import User from "./schema/userSchema";

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
  },
});

app.use(express.json());
app.use(cors());

io.on("connection", async (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("register", async (userAddress) => {
    try {
      const user = await User.findOneAndUpdate(
        { userAddress: userAddress },
        { socketId: socket.id, isActive: true },
        { new: true, upsert: true }
      );

      console.log(`User ${userAddress} is now active with socketId: ${socket.id}`);
    } catch (error) {
      console.error("Error in user connect status update:", error);
    }
  });

  socket.on("sendMessage", async(messageData, userAddress) => {
    let recipient;
    try {
      recipient = await User.findOne({ userAddress: userAddress });      
    } catch (error) {
      console.error("Error fetching recipient: ", error);
    }

    console.log("here " + recipient);

    if(recipient && recipient.isActive) {
      socket.to(recipient.socketId).emit("receiveMessage", messageData);
    }
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);
    try {
      await User.findOneAndUpdate(
        { socketId: socket.id },
        { socketId: "", isActive: false }
      );

      console.log(`User with socketId ${socket.id} is now inactive`);
    } catch (error) {
      console.error("Error in user disconnect status update:", error);
    }
  });
});


app.post("/api/circle/:type", async (req: Request, res: Response) => {
  console.log();
  const type = req.params.type.toUpperCase();
  const { userAddress } = req.body;

  console.log(userAddress);

  try {
    const response = await fetch(
      `https://api.circle.com/v1/w3s/ramp/sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
        },
        body: JSON.stringify({
          mode: "QUOTE_SCREEN",
          rampType: type,
          walletAddress: {
            blockchain: "ETH-SEPOLIA",
            address: userAddress,
          },
          country: {
            country: "US",
          },
          customerRefId: "test_user",
          fiatAmount: {
            amount: "10000",
            currency: "USD",
          },
          cryptoAmount: {
            currency: "USDC",
          },
        }),
      }
    );
    const json = await response.json();
    console.log(json);
    res.json({ url: json });

  } catch (error) {
    res.json({ error: error });
  }
});

app.get("/api/test", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Test route",
  });
})

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});