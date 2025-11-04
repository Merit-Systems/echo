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

const SCHEME = 'exact';

export async function verify(
  payload: PaymentPayload,
  paymentRequirements: PaymentRequirements
): Promise<VerifyResponse> {
  if (payload.scheme !== SCHEME || paymentRequirements.scheme !== SCHEME) {
    return {
      isValid: false,
      invalidReason: 'unsupported_scheme',
      payer: undefined,
    };
  }

  const parseResult = ExactEvmPayloadSchema.safeParse(payload.payload);

  if (!parseResult.success) {
    return {
      isValid: false,
      invalidReason: 'invalid_payload',
      payer: undefined,
    };
  }

  const exactEvmPayload = parseResult.data;

  const network = payload.network;
  const chainId = getNetworkId(network);
  const erc20Address = paymentRequirements.asset as Address;

  if (!chainId) {
    return {
      isValid: false,
      invalidReason: 'invalid_network',
      payer: exactEvmPayload.authorization.from,
    };
  }

  if (erc20Address !== USDC_ADDRESS_BY_NETWORK[network]) {
    return {
      isValid: false,
      invalidReason: 'invalid_payment',
      payer: exactEvmPayload.authorization.from,
    };
  }

  // Verify that payment was made to the correct address
  if (
    getAddress(exactEvmPayload.authorization.to) !==
    getAddress(paymentRequirements.payTo)
  ) {
    return {
      isValid: false,
      invalidReason: 'invalid_exact_evm_payload_recipient_mismatch',
      payer: exactEvmPayload.authorization.from,
    };
  }

  // Verify deadline is not yet expired (pad 3 blocks = 6 seconds)
  if (
    BigInt(exactEvmPayload.authorization.validBefore) <
    BigInt(Math.floor(Date.now() / 1000) + 6)
  ) {
    return {
      isValid: false,
      invalidReason: 'invalid_exact_evm_payload_authorization_valid_before',
      payer: exactEvmPayload.authorization.from,
    };
  }

  // Verify deadline is not yet valid
  if (
    BigInt(exactEvmPayload.authorization.validAfter) >
    BigInt(Math.floor(Date.now() / 1000))
  ) {
    return {
      isValid: false,
      invalidReason: 'invalid_exact_evm_payload_authorization_valid_after',
      payer: exactEvmPayload.authorization.from,
    };
  }

  // Verify client has enough funds to cover paymentRequirements.maxAmountRequired
  const balance = await getERC20Balance(
    network,
    erc20Address,
    exactEvmPayload.authorization.from as Address
  );

  if (balance < BigInt(paymentRequirements.maxAmountRequired)) {
    return {
      isValid: false,
      invalidReason: 'insufficient_funds',
      payer: exactEvmPayload.authorization.from,
    };
  }

  // Verify value in payload is enough to cover paymentRequirements.maxAmountRequired
  if (
    BigInt(exactEvmPayload.authorization.value) <
    BigInt(paymentRequirements.maxAmountRequired)
  ) {
    return {
      isValid: false,
      invalidReason: 'invalid_exact_evm_payload_authorization_value',
      payer: exactEvmPayload.authorization.from,
    };
  }

  return {
    isValid: true,
    invalidReason: undefined,
    payer: exactEvmPayload.authorization.from,
  };
}

export async function settle(
  paymentPayload: PaymentPayload,
  paymentRequirements: PaymentRequirements
): Promise<SettleResponse> {
  const valid = await verify(paymentPayload, paymentRequirements);

  if (!valid.isValid) {
    return {
      success: false,
      network: paymentPayload.network,
      transaction: '',
      errorReason: valid.invalidReason ?? 'invalid_scheme',
      payer: valid.payer,
    };
  }

  const parseResult = ExactEvmPayloadSchema.safeParse(paymentPayload.payload);

  if (!parseResult.success) {
    return {
      success: false,
      network: paymentPayload.network,
      transaction: '',
      errorReason: 'invalid_payload',
      payer: undefined,
    };
  }

  const payload = parseResult.data;

  const { signature } = parseErc6492Signature(payload.signature as Hex);

  const { smartAccount } = await getSmartAccount();

  const ETH_WARNING_THRESHOLD = parseUnits(
    String(process.env.ETH_WARNING_THRESHOLD || '0.0001'),
    18 // ETH decimals
  );

  const ethereumBalance = await getEthereumBalance(
    paymentPayload.network,
    smartAccount.address
  );
  logger.info('Ethereum balance', {
    balance: ethereumBalance,
    address: smartAccount.address,
  });
  if (ethereumBalance < ETH_WARNING_THRESHOLD) {
    const ethBalanceFormatted = formatUnits(ethereumBalance, 18);
    const readableEthWarningThreshold = formatUnits(ETH_WARNING_THRESHOLD, 18);

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

    return {
      success: false,
      network: paymentPayload.network,
      transaction: '',
      errorReason: 'insufficient_funds',
      payer: valid.payer,
    };
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

  const result = await smartAccount.sendUserOperation({
    network: paymentPayload.network as 'base' | 'base-sepolia',
    calls: [
      {
        to: paymentRequirements.asset as `0x${string}`,
        value: 0n,
        data: callData as `0x${string}`,
      },
    ],
  });

  await smartAccount.waitForUserOperation({
    userOpHash: result.userOpHash,
  });

  logger.info('Settlement transaction completed', {
    userOpHash: result.userOpHash,
  });

  return {
    success: true,
    transaction: result.userOpHash,
    network: paymentPayload.network,
    payer: payload.authorization.from,
  };
}
