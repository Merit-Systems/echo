import { createPublicClient, http, type Address } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { ERC20_CONTRACT_ABI } from './abi';
import { env } from '@/env';

export type Network = 'base' | 'base-sepolia';

const NETWORK_TO_CHAIN = {
  base: base,
  'base-sepolia': baseSepolia,
} as const;

export async function getERC20Balance(
  network: Network,
  erc20Address: Address,
  userAddress: Address
): Promise<bigint> {
  const chain = NETWORK_TO_CHAIN[network];
  if (!chain) {
    throw new Error(`Unsupported network for balance check: ${network}`);
  }

  const baseRpcUrl = env.BASE_RPC_URL ?? undefined;

  const client = createPublicClient({
    chain,
    transport: http(baseRpcUrl),
  });

  const balance = await client.readContract({
    address: erc20Address,
    abi: ERC20_CONTRACT_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
  });

  return balance;
}

export async function getEthereumBalance(
  network: Network,
  userAddress: Address
): Promise<bigint> {
  const chain = NETWORK_TO_CHAIN[network];
  if (!chain) {
    throw new Error(`Unsupported network for balance check: ${network}`);
  }

  const baseRpcUrl = env.BASE_RPC_URL ?? undefined;

  const client = createPublicClient({
    chain,
    transport: http(baseRpcUrl),
  });

  const balance = await client.getBalance({
    address: userAddress,
  });

  return balance;
}
