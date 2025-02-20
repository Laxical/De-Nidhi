import express from "express"
import { Request, Response } from "express";
import privy from "../config/privyConfig";
import Chat from "../schema/chatSchema";

const chatController = express.Router();

chatController.get("/getChats/:friendAddress", async (req: Request, res: Response): Promise<void> => {
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

export default chatController