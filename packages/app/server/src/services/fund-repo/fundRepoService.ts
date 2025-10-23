import { CdpClient } from '@coinbase/cdp-sdk';
import { encodeFunctionData, Abi } from 'viem';
import {
  MERIT_ABI,
  MERIT_CONTRACT_ADDRESS,
  USDC_ADDRESS,
  ERC20_CONTRACT_ABI,
} from './constants';
import logger from '../../logger';

export interface FundRepoResult {
  success: boolean;
  userOpHash: string;
  smartAccountAddress: string;
  amount: number;
  repoId: string;
  tokenAddress: string;
}

const API_KEY_ID = process.env.CDP_API_KEY_ID || 'your-api-key-id';
const API_KEY_SECRET = process.env.CDP_API_KEY_SECRET || 'your-api-key-secret';
const WALLET_SECRET = process.env.CDP_WALLET_SECRET || 'your-wallet-secret';

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

    // CDP wallets
    const cdp = new CdpClient({
      apiKeyId: API_KEY_ID,
      apiKeySecret: API_KEY_SECRET,
      walletSecret: WALLET_SECRET,
    });
    const owner = await cdp.evm.getOrCreateAccount({
      name: 'echo-fund-owner',
    });
    const smartAccount = await cdp.evm.getOrCreateSmartAccount({
      name: 'echo-fund-smart-account',
      owner,
    });
    logger.info(`Smart account address: ${smartAccount.address}`);

    // Send user operation to fund the repo
    const result = await cdp.evm.sendUserOperation({
      smartAccount,
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
    await cdp.evm.waitForUserOperation({
      smartAccountAddress: smartAccount.address,
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
  } catch (error) {
    logger.error(
      `Error in funding repo: ${error instanceof Error ? error.message : 'Unknown error'} | Amount: ${amount} | Stack: ${error instanceof Error ? error.stack : 'No stack'} | Timestamp: ${new Date().toISOString()}`
    );

    throw error;
  }
}

export async function safeFundRepo(amount: number): Promise<void> {
  try {
    const repoId = process.env.MERIT_REPO_ID;
    if (!repoId) {
      throw new Error('Missing required environment variables');
    }
    await fundRepo(amount, Number(repoId));
  } catch (error) {
    logger.error(
      `Error in safe funding repo: ${error instanceof Error ? error.message : 'Unknown error'} | Amount: ${amount}`
    );
  }
}
