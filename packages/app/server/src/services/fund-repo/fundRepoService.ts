import { encodeFunctionData, Abi } from 'viem';
import {
  MERIT_ABI,
  MERIT_CONTRACT_ADDRESS,
  USDC_ADDRESS,
  ERC20_CONTRACT_ABI,
} from './constants';
import logger from '../../logger';
import { getSmartAccount } from 'utils';
import { ResultAsync, fromPromise } from 'neverthrow';

export interface FundRepoResult {
  success: boolean;
  userOpHash: string;
  smartAccountAddress: string;
  amount: number;
  repoId: string;
  tokenAddress: string;
}
export function fundRepo(
  amount: number,
  repoId: number
): ResultAsync<FundRepoResult, Error> {
  // Validate inputs
  if (!amount || typeof amount !== 'number') {
    return ResultAsync.fromSafePromise(
      Promise.reject(new Error('Invalid amount provided'))
    );
  }

  if (!USDC_ADDRESS || !MERIT_CONTRACT_ADDRESS) {
    return ResultAsync.fromSafePromise(
      Promise.reject(new Error('Missing required environment variables'))
    );
  }

  return fromPromise(
    (async (): Promise<FundRepoResult> => {
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
            to: tokenAddress as `0x${string}`,
            value: 0n,
            data: encodeFunctionData({
              abi: ERC20_CONTRACT_ABI as Abi,
              functionName: 'approve',
              args: [MERIT_CONTRACT_ADDRESS, amountBigInt],
            }),
          },
          {
            to: MERIT_CONTRACT_ADDRESS as `0x${string}`,
            value: 0n,
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

      logger.info('User operation processed successfully');

      return {
        success: true,
        userOpHash: result.userOpHash,
        smartAccountAddress: smartAccount.address,
        amount: amount,
        repoId: repoId.toString(),
        tokenAddress: tokenAddress,
      };
    })(),
    (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack';
      logger.error(
        `Error in funding repo: ${errorMessage} | Amount: ${amount} | Stack: ${errorStack} | Timestamp: ${new Date().toISOString()}`
      );
      return error instanceof Error ? error : new Error(String(error));
    }
  );
}

export function safeFundRepo(amount: number): ResultAsync<void, Error> {
  const repoId = process.env.MERIT_REPO_ID;
  if (!repoId) {
    return ResultAsync.fromSafePromise(
      Promise.reject(new Error('Missing required environment variables'))
    );
  }

  return fundRepo(amount, Number(repoId))
    .map(() => {
      // Success case - no return value needed for void
    })
    .mapErr((error: Error) => {
      logger.error(
        `Error in safe funding repo: ${error.message} | Amount: ${amount}`
      );
      return error;
    });
}
