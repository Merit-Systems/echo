import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, mainnet } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Chat x402",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [base, mainnet],
  ssr: true,
});
