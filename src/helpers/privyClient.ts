import dotenv from 'dotenv';
dotenv.config();
import { PrivyClient } from '@privy-io/server-auth';
const privyAppId: string = process.env.PRIVY_APP_ID || "";
const privySecret: string = process.env.PRIVY_SECRET || "";

export const privy = new PrivyClient(privyAppId, privySecret);