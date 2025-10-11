import { CdpClient } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";
import { toAccount } from "viem/accounts";

dotenv.config();

if (
    !process.env.CDP_API_KEY_ID 
    || !process.env.CDP_API_KEY_SECRET 
    || !process.env.CDP_WALLET_SECRET 
    || !process.env.CDP_WALLET_OWNER) {
    throw new Error("CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET, and CDP_WALLET_OWNER must be set");
}


const cdp = new CdpClient({
    apiKeyId: process.env.CDP_API_KEY_ID,
    apiKeySecret: process.env.CDP_API_KEY_SECRET,
    walletSecret: process.env.CDP_WALLET_SECRET,
  });
  

const account = await cdp.evm.getOrCreateAccount({
    name: process.env.CDP_WALLET_OWNER,
  });

export const walletClient = toAccount(account);