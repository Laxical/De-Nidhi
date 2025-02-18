import express, { Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

dotenv.config();
mongoose.connect(process.env.MONGO_URI || "");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});