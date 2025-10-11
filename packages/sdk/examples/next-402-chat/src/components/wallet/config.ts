import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, polygon, optimism, arbitrum, base, baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Echo Demo App',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [mainnet, sepolia, polygon, optimism, arbitrum, base, baseSepolia],
  ssr: true,
});
