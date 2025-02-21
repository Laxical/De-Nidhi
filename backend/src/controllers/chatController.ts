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
      }).sort({ timestamp: 1 });
  
      res.status(200).json({ chatHistory });
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ error: "Failed to retrieve chat history." });
    }
});

chatController.post("/request/:id/pay", async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req
  const { id } = req.params
  const { transactionHash } = req.body

  try {
    const user = await privy.getUser({ idToken });
  
    if (!user || !user.wallet?.address) {
      res.status(401).json({ error: "Unauthorized: Invalid user." });
    }

    const userAddress = user.wallet?.address;

    const updatedChat = await Chat.findOneAndUpdate({_id: id, recipient: userAddress}, {transactionHash: transactionHash, status: true}, {new: true});

    console.log(updatedChat);

    res.status(200).json({ message: "transaction added successfully." });
  } catch (error) {
    console.error("Error adding chat:", error);
    res.status(500).json({ error: "Failed to add chat." });
  }
});

chatController.post("/request/:id/decline", async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req
  const { id } = req.params

  try {
    const user = await privy.getUser({ idToken });
  
    if (!user || !user.wallet?.address) {
      res.status(401).json({ error: "Unauthorized: Invalid user." });
    }

    const userAddress = user.wallet?.address;

    const updatedChat = await Chat.findOneAndUpdate({_id: id, recipient: userAddress}, {isDeclined: true}, {new: true});

    console.log(updatedChat);

    res.status(200).json({ message: "transaction added successfully." });
  } catch (error) {
    console.error("Error adding chat:", error);
    res.status(500).json({ error: "Failed to add chat." });
  }
});

chatController.post("/directPay", async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req
  const { id } = req.params
  const newMessage = req.body

  try {
    const user = await privy.getUser({ idToken });
  
    if (!user || !user.wallet?.address) {
      res.status(401).json({ error: "Unauthorized: Invalid user." });
    }

    const userAddress = user.wallet?.address;

    const newChat = new Chat({
      sender: userAddress,
      recipient: newMessage.recipient,
      text: newMessage.text || "",
      isTransfer: newMessage.isTransfer || false,
      isRequest: newMessage.isRequest || false,
      amount: newMessage.amount,
      transactionHash: newMessage.transactionHash,
      status: newMessage.status || false,
    });

    await newChat.save();

    console.log(newChat);

    res.status(200).json({ message: "transaction added successfully." });
  } catch (error) {
    console.error("Error adding chat:", error);
    res.status(500).json({ error: "Failed to add chat." });
  }
});

export default chatController