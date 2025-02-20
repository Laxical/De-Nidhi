import express from "express"
import privy from "../config/privyConfig";
import User from "../schema/userSchema";
import { Request, Response } from "express";
import { authenticateUser } from "../middlewares/privyAuthMiddleware";

const userController = express.Router();

userController.post("/addFriend/:friendAddress", async (req: Request, res: Response): Promise<void> => {
    const { idToken } = req;
    const { friendAddress } = req.params;
  
    try {
      const user = await privy.getUser({ idToken });
  
      if (!user || !user.wallet?.address) {
        res.status(401).json({ error: "Unauthorized: Invalid user." });
        return;
      }
  
      const userAddress = user.wallet.address;
  
      if (userAddress === friendAddress) {
        res.status(400).json({ error: "You cannot add yourself as a friend." });
        return;
      }
  
      const userData = await User.findOne({ userAddress });
      const friendData = await User.findOne({ userAddress: friendAddress });
  
      if (!friendData) {
        res.status(404).json({ error: "Friend not found." });
        return;
      }
  
        if(!userData?.friends.includes(friendAddress)) await User.updateOne({ userAddress }, { $addToSet: { friends: friendAddress } });
        if(!friendData.friends.includes(userAddress)) await User.updateOne({ userAddress: friendAddress }, { $addToSet: { friends: userAddress } });
    
        res.status(200).json({ message: "Friend added successfully!" });
    } catch (error) {
        console.error("Error adding friend:", error);
        res.status(500).json({ error: "Failed to add friend." });
    }
});
  
userController.get("/getFriends", async (req: Request, res: Response): Promise<void> => {
    const { idToken } = req;
  
    try {
        const user = await privy.getUser({ idToken });
  
        if (!user || !user.wallet?.address) {
        res.status(401).json({ error: "Unauthorized: Invalid user." });
    }
  
    const userAddress = user.wallet?.address;
  
    const userData = await User.findOne({ userAddress }, "friends");
  
    res.status(200).json({ friends: userData.friends });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve friends." });
    }
});

export default userController