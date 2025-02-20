import express, { Request, Response } from "express";
import cookieParser from "cookie-parser"
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import User from "./schema/userSchema";
import Chat from "./schema/chatSchema";
import { PrivyClient } from "@privy-io/server-auth"
import { authenticateUser } from "./middlewares/privyAuthMiddleware";

dotenv.config();
mongoose.connect(process.env.MONGO_URI || "");
const privy = new PrivyClient(
  process.env.PRIVY_APP_ID as string,
  process.env.PRIVY_APP_SECRET as string,
);


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

app.use(express.json());
app.use(cors());
app.use(cookieParser());

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

  socket.on("sendMessage", async(messageData) => {
    let recipient;
    try {
      recipient = await User.findOne({ userAddress: messageData.recipient });
    } catch (error) {
      console.error("Error fetching recipient: ", error);
    }

    // console.log("here " + recipient);

    const chat = new Chat({
      sender: messageData.sender,
      recipient: messageData.recipient,
      text: messageData.text,
    });

    const newChat = await chat.save();

    console.log(newChat);

    if(recipient && recipient.isActive) {
      socket.to(recipient.socketId).emit("receiveMessage", newChat);
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

app.get("/api/getChats/:friendAddress", authenticateUser, async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req;
  const { friendAddress } = req.params;

  try {
    const user = await privy.getUser({ idToken });

    if (!user || !user.wallet?.address) {
      res.status(401).json({ error: "Unauthorized: Invalid user." });
    }

    const userAddress = user.wallet?.address;

    const chatHistory = await Chat.find({
      $or: [
        { sender: userAddress, recipient: friendAddress },
        { sender: friendAddress, recipient: userAddress },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ chatHistory });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to retrieve chat history." });
  }
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