import {
  ERC20_CONTRACT_ABI,
  USDC_ADDRESS,
} from './services/fund-repo/constants';
import { Abi, encodeFunctionData } from 'viem';
import { SendUserOperationReturnType } from './types';
import { getSmartAccount } from './utils';

export async function transfer(
  to: string,
  value: BigInt
): Promise<SendUserOperationReturnType> {
  try {
    const { smartAccount } = await getSmartAccount();

    const result = await smartAccount.sendUserOperation({
      network: 'base',
      calls: [
        {
          to: USDC_ADDRESS,
          value: 0n,
          data: encodeFunctionData({
            abi: ERC20_CONTRACT_ABI as Abi,
            functionName: 'transfer',
            args: [to, value.toString()],
          }),
        },
      ],
    });

    return result;
  } catch (error) {
    throw new Error(
      `Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
