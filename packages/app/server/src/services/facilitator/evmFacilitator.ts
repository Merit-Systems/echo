import {
  getAddress,
  Hex,
  parseErc6492Signature,
  Address,
  encodeFunctionData,
  Abi,
  parseUnits,
  formatUnits,
} from 'viem';
import { getNetworkId, getERC20Balance, getEthereumBalance } from './evmUtils';
import {
  PaymentPayload,
  PaymentRequirements,
  VerifyResponse,
  SettleResponse,
  ExactEvmPayloadSchema,
} from './x402-types';
import { USDC_ADDRESS_BY_NETWORK } from '../../constants';
import { ERC3009_ABI } from '../fund-repo/constants';
import { getSmartAccount } from '../../utils';
import logger, { logMetric } from 'logger';
import { ResultAsync, fromPromise } from 'neverthrow';

const SCHEME = 'exact';

export function verify(
  payload: PaymentPayload,
  paymentRequirements: PaymentRequirements
): ResultAsync<VerifyResponse, Error> {
  if (payload.scheme !== SCHEME || paymentRequirements.scheme !== SCHEME) {
    return ResultAsync.fromSafePromise(
      Promise.resolve({
        isValid: false,
        invalidReason: 'invalid_scheme',
        payer: undefined,
      } as VerifyResponse)
    );
  }

  const parseResult = ExactEvmPayloadSchema.safeParse(payload.payload);

  if (!parseResult.success) {
    return ResultAsync.fromSafePromise(
      Promise.resolve({
        isValid: false,
        invalidReason: 'invalid_payload',
        payer: undefined,
      } as VerifyResponse)
    );
  }

  const exactEvmPayload = parseResult.data;

  const network = payload.network;
  const chainId = getNetworkId(network);
  const erc20Address = paymentRequirements.asset as Address;

  if (!chainId) {
    return ResultAsync.fromSafePromise(
      Promise.resolve({
        isValid: false,
        invalidReason: 'invalid_network',
        payer: exactEvmPayload.authorization.from,
      } as VerifyResponse)
    );
  }

  if (erc20Address !== USDC_ADDRESS_BY_NETWORK[network]) {
    return ResultAsync.fromSafePromise(
      Promise.resolve({
        isValid: false,
        invalidReason: 'invalid_payment',
        payer: exactEvmPayload.authorization.from,
      } as VerifyResponse)
    );
  }

  // Verify that payment was made to the correct address
  if (
    getAddress(exactEvmPayload.authorization.to) !==
    getAddress(paymentRequirements.payTo)
  ) {
    return ResultAsync.fromSafePromise(
      Promise.resolve({
        isValid: false,
        invalidReason: 'invalid_exact_evm_payload_recipient_mismatch',
        payer: exactEvmPayload.authorization.from,
      } as VerifyResponse)
    );
  }

  // Verify deadline is not yet expired (pad 3 blocks = 6 seconds)
  if (
    BigInt(exactEvmPayload.authorization.validBefore) <
    BigInt(Math.floor(Date.now() / 1000) + 6)
  ) {
    return ResultAsync.fromSafePromise(
      Promise.resolve({
        isValid: false,
        invalidReason: 'invalid_exact_evm_payload_authorization_valid_before',
        payer: exactEvmPayload.authorization.from,
      } as VerifyResponse)
    );
  }

  // Verify deadline is not yet valid
  if (
    BigInt(exactEvmPayload.authorization.validAfter) >
    BigInt(Math.floor(Date.now() / 1000))
  ) {
    return ResultAsync.fromSafePromise(
      Promise.resolve({
        isValid: false,
        invalidReason: 'invalid_exact_evm_payload_authorization_valid_after',
        payer: exactEvmPayload.authorization.from,
      } as VerifyResponse)
    );
  }

  // Verify client has enough funds to cover paymentRequirements.maxAmountRequired
  return fromPromise(
    getERC20Balance(
      network,
      erc20Address,
      exactEvmPayload.authorization.from as Address
    ),
    error =>
      new Error(
        `Failed to get ERC20 balance: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
  ).andThen(balance => {
    if (balance < BigInt(paymentRequirements.maxAmountRequired)) {
      return ResultAsync.fromSafePromise(
        Promise.resolve({
          isValid: false,
          invalidReason: 'insufficient_funds',
          payer: exactEvmPayload.authorization.from,
        } as VerifyResponse)
      );
    }

    // Verify value in payload is enough to cover paymentRequirements.maxAmountRequired
    if (
      BigInt(exactEvmPayload.authorization.value) <
      BigInt(paymentRequirements.maxAmountRequired)
    ) {
      return ResultAsync.fromSafePromise(
        Promise.resolve({
          isValid: false,
          invalidReason: 'invalid_exact_evm_payload_authorization_value',
          payer: exactEvmPayload.authorization.from,
        } as VerifyResponse)
      );
    }

    return ResultAsync.fromSafePromise(
      Promise.resolve({
        isValid: true,
        invalidReason: undefined,
        payer: exactEvmPayload.authorization.from,
      } as VerifyResponse)
    );
  });
}

export function settle(
  paymentPayload: PaymentPayload,
  paymentRequirements: PaymentRequirements
): ResultAsync<SettleResponse, Error> {
  return verify(paymentPayload, paymentRequirements).andThen(valid => {
    if (!valid.isValid) {
      return ResultAsync.fromSafePromise(
        Promise.resolve({
          success: false,
          network: paymentPayload.network,
          transaction: '',
          errorReason: valid.invalidReason ?? 'invalid_scheme',
          payer: valid.payer,
        } as SettleResponse)
      );
    }

    const parseResult = ExactEvmPayloadSchema.safeParse(paymentPayload.payload);

    if (!parseResult.success) {
      return ResultAsync.fromSafePromise(
        Promise.resolve({
          success: false,
          network: paymentPayload.network,
          transaction: '',
          errorReason: 'invalid_payload',
          payer: undefined,
        } as SettleResponse)
      );
    }

    const payload = parseResult.data;

    const { signature } = parseErc6492Signature(payload.signature as Hex);

    return getSmartAccount().andThen(({ smartAccount }) => {
      const ETH_WARNING_THRESHOLD = parseUnits(
        String(process.env.ETH_WARNING_THRESHOLD || '0.0001'),
        18 // ETH decimals
      );

      return fromPromise(
        getEthereumBalance(paymentPayload.network, smartAccount.address),
        error =>
          new Error(
            `Failed to get Ethereum balance: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
      ).andThen(ethereumBalance => {
        logger.info('Ethereum balance', {
          balance: ethereumBalance,
          address: smartAccount.address,
        });
        if (ethereumBalance < ETH_WARNING_THRESHOLD) {
          const ethBalanceFormatted = formatUnits(ethereumBalance, 18);
          const readableEthWarningThreshold = formatUnits(
            ETH_WARNING_THRESHOLD,
            18
          );

          logger.warn(
            `Ethereum balance is less than ${readableEthWarningThreshold} ETH`,
            {
              balance: ethBalanceFormatted,
              threshold: readableEthWarningThreshold,
              address: smartAccount.address,
            }
          );

          logMetric('server_wallet.ethereum_balance_running_low', 1, {
            amount: ethBalanceFormatted,
            address: smartAccount.address,
          });

          return ResultAsync.fromSafePromise(
            Promise.resolve({
              success: false,
              network: paymentPayload.network,
              transaction: '',
              errorReason: 'insufficient_funds',
              payer: valid.payer,
            } as SettleResponse)
          );
        }

        const callData = encodeFunctionData({
          abi: ERC3009_ABI as Abi,
          functionName: 'transferWithAuthorization',
          args: [
            payload.authorization.from as Address,
            payload.authorization.to as Address,
            BigInt(payload.authorization.value),
            BigInt(payload.authorization.validAfter),
            BigInt(payload.authorization.validBefore),
            payload.authorization.nonce as Hex,
            signature,
          ],
        });

        return fromPromise(
          smartAccount.sendUserOperation({
            network: paymentPayload.network as 'base' | 'base-sepolia',
            calls: [
              {
                to: paymentRequirements.asset as `0x${string}`,
                value: 0n,
                data: callData as `0x${string}`,
              },
            ],
          }),
          error =>
            new Error(
              `Failed to send user operation: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        ).andThen(result => {
          return fromPromise(
            smartAccount.waitForUserOperation({
              userOpHash: result.userOpHash,
            }),
            error =>
              new Error(
                `Failed to wait for user operation: ${error instanceof Error ? error.message : 'Unknown error'}`
              )
          ).andThen(() => {
            logger.info('Settlement transaction completed', {
              userOpHash: result.userOpHash,
            });

            return ResultAsync.fromSafePromise(
              Promise.resolve({
                success: true,
                transaction: result.userOpHash,
                network: paymentPayload.network,
                payer: payload.authorization.from,
              } as SettleResponse)
            );
          });
        });
      });
    });
  });
}
