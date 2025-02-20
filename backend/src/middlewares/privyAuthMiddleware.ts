import { PrivyClient } from "@privy-io/server-auth"
import dotenv from "dotenv"
import { Request, Response, NextFunction } from "express"

dotenv.config()

const PRIVY_APP_ID = process.env.PRIVY_APP_ID as string
const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET as string

const privy = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET)

declare module "express-serve-static-core" {
  interface Request {
    user?: any,
    idToken?: any
  }
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers["authorization"]

        if (!authHeader || typeof authHeader !== "string") {
        res.status(401).json({ error: "Unauthorized: No token provided" })
        }

        if(!authHeader) return;

        const token = authHeader.split(" ")[1]

        if (!token) {
            res.status(401).json({ error: "Unauthorized: No token provided" })
        }

        const user = await privy.verifyAuthToken(token)

        if (!user) {
            res.status(401).json({ error: "Unauthorized: Invalid token" })
        }

        req.user = user;
        req.idToken = req.headers["privy-id-token"]
        next();
    } catch (error) {
        console.error("Error verifying Privy token:", error)
        res.status(401).json({ error: "Unauthorized: Token verification failed" })
    }
}
