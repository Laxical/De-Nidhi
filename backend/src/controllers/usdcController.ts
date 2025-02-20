import express from "express"
import { Request, Response } from "express";
import privy from "../config/privyConfig";

const usdcController = express.Router();

usdcController.post("/sendUSDC", async (req: Request, res: Response) => {
    const { user, idToken } = req;
    const { recipientAddress, amount } = req.body;
  
    try {
        const user = await privy.getUser({ idToken });
  
        if (!user || !user.wallet?.address) {
            res.status(401).json({ error: "Unauthorized: Invalid user." });
            return;
        }
    
        const userAddress = user.wallet.address;


  
    } catch (error) {
        res.json({ error: error });
    }
});

export default usdcController