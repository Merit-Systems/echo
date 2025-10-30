import type { Address, Hex } from 'viem';
import { getSmartAccount } from './smart-account';
import type { Network } from './get-balance';

interface TransferParams {
  recipientAddress: string;
  amount: bigint;
  token?: 'eth' | 'usdc' | Hex;
  network?: Network;
}

export interface TransferResult {
  userOpHash: Hex;
  status: string;
  smartAccountAddress: Address;
  recipientAddress: string;
  amount: bigint;
}

export async function transfer({
  recipientAddress,
  amount,
  token = 'usdc',
  network = 'base',
}: TransferParams): Promise<TransferResult> {
  const { smartAccount } = await getSmartAccount();

  const result = await smartAccount.transfer({
    to: recipientAddress as Address,
    amount,
    token,
    network,
  });

  return {
    userOpHash: result.userOpHash,
    status: result.status,
    smartAccountAddress: result.smartAccountAddress,
    recipientAddress,
    amount,
  };
}
