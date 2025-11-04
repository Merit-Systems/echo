import { Network } from './x402-types';
import { createPublicClient, http, Address } from 'viem';
import { ERC20_CONTRACT_ABI } from '../fund-repo/constants';
import { NETWORK_TO_CHAIN_ID, NETWORK_TO_CHAIN } from '../../constants';

export function getNetworkId(network: Network): number {
  const chainId = NETWORK_TO_CHAIN_ID[network];
  if (!chainId) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return chainId;
}

export async function getERC20Balance(
  network: Network,
  erc20Address: Address,
  userAddress: Address
): Promise<bigint> {
  const chain = NETWORK_TO_CHAIN[network as keyof typeof NETWORK_TO_CHAIN];
  if (!chain) {
    throw new Error(`Unsupported network for balance check: ${network}`);
  }

  const baseRpcUrl = process.env.BASE_RPC_URL || undefined;

  const client = createPublicClient({
    chain,
    transport: http(baseRpcUrl),
  });

  const balance = (await client.readContract({
    address: erc20Address,
    abi: ERC20_CONTRACT_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
  })) as bigint;

  return balance;
}

export async function getEthereumBalance(
  network: Network,
  userAddress: Address
): Promise<bigint> {
  const chain = NETWORK_TO_CHAIN[network as keyof typeof NETWORK_TO_CHAIN];
  if (!chain) {
    throw new Error(`Unsupported network for balance check: ${network}`);
  }

  const baseRpcUrl = process.env.BASE_RPC_URL || undefined;

  const client = createPublicClient({
    chain,
    transport: http(baseRpcUrl),
  });

  const balance = await client.getBalance({
    address: userAddress,
  });

  return balance;
}
