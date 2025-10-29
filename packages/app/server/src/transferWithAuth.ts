import {
  ERC20_CONTRACT_ABI,
  USDC_ADDRESS,
} from './services/fund-repo/constants';
import { Abi, encodeFunctionData } from 'viem';
import { SendUserOperationReturnType } from './types';
import { getSmartAccount } from './utils';
import { ResultAsync, fromPromise } from 'neverthrow';

export function transfer(
  to: string,
  value: BigInt
): ResultAsync<SendUserOperationReturnType, Error> {
  return getSmartAccount().andThen(({ smartAccount }) => {
    return fromPromise(
      smartAccount.sendUserOperation({
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
      }),
      (error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        return new Error(`Transfer failed: ${errorMessage}`);
      }
    );
  });
}
