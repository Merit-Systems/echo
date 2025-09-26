import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { getDefaultConfig } from 'connectkit';

export const config = createConfig(
  getDefaultConfig({
    chains: [base],
    transports: {
      [base.id]: http(),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    appName: "X402 Chat",
    appDescription: "X402 Chat Application",
    appUrl: "https://x402-chat.com",
  }),
);
