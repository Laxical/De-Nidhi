import express from "express"
import { Request, Response } from "express";

const circleController = express.Router();

circleController.post("/api/circle/:type", async (req: Request, res: Response) => {
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

export default circleController