import { encodeFunctionData, type Abi } from 'viem';
import { getSmartAccount } from './smart-account';
import { logger } from '@/logger';
import { ERC20_CONTRACT_ABI, MERIT_ABI } from './abi';
import { env } from '@/env';

export const MERIT_CONTRACT_ADDRESS =
  env.MERIT_CONTRACT_ADDRESS as `0x${string}`;
const USDC_ADDRESS = env.USDC_ADDRESS as `0x${string}`;

// Types
export interface FundRepoResult {
  success: boolean;
  userOpHash: string;
  smartAccountAddress: string;
  amount: number;
  repoId: string;
  tokenAddress: string;
}
// Main functions
export async function fundRepo(
  amount: number,
  repoId: number
): Promise<FundRepoResult> {
  try {
    if (!amount || typeof amount !== 'number') {
      throw new Error('Invalid amount provided');
    }

    if (!USDC_ADDRESS || !MERIT_CONTRACT_ADDRESS) {
      throw new Error('Missing required environment variables');
    }

    const tokenAddress = USDC_ADDRESS;
    const repoInstanceId = 0;
    // Convert to BigInt safely by avoiding floating point precision issues
    // USDC has 6 decimals, so multiply by 10^6
    // Use Math.ceil for defensive rounding to avoid undercharging
    const amountBigInt = BigInt(Math.ceil(amount * 10 ** 6));

    const { smartAccount } = await getSmartAccount();

    // Send user operation to fund the repo
    const result = await smartAccount.sendUserOperation({
      network: 'base',
      calls: [
        {
          to: tokenAddress,
          value: BigInt(0),
          data: encodeFunctionData({
            abi: ERC20_CONTRACT_ABI as Abi,
            functionName: 'approve',
            args: [MERIT_CONTRACT_ADDRESS, amountBigInt],
          }),
        },
        {
          to: MERIT_CONTRACT_ADDRESS,
          value: BigInt(0),
          data: encodeFunctionData({
            abi: MERIT_ABI as Abi,
            functionName: 'fundRepo',
            args: [
              BigInt(repoId),
              BigInt(repoInstanceId),
              tokenAddress,
              amountBigInt,
              '0x',
            ],
          }),
        },
      ],
    });

    // Wait for the user operation to be processed
    await smartAccount.waitForUserOperation({
      userOpHash: result.userOpHash,
    });

    logger.emit({
      severityText: 'INFO',
      body: 'User operation processed successfully',
    });

    return {
      success: true,
      userOpHash: result.userOpHash,
      smartAccountAddress: smartAccount.address,
      amount: amount,
      repoId: repoId.toString(),
      tokenAddress: tokenAddress,
    };
  } catch (error) {
    logger.emit({
      severityText: 'ERROR',
      body: `Error in funding repo: ${error instanceof Error ? error.message : 'Unknown error'}`,
      attributes: {
        amount,
        stack: error instanceof Error ? error.stack : 'No stack',
        timestamp: new Date().toISOString(),
      },
    });

    throw error;
  }
}
