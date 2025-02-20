import dotenv from "dotenv";
import { PrivyClient } from "@privy-io/server-auth"

dotenv.config();

const privy = new PrivyClient(
    process.env.PRIVY_APP_ID as string,
    process.env.PRIVY_APP_SECRET as string,
);

export default privy