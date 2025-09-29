import {
  ExactEvmPayloadAuthorization,
  Network,
  X402ChallengeParams,
} from 'types';
import { Request, Response } from 'express';
import { SmartAccount } from '@coinbase/cdp-sdk/_types/client/evm/evm.types';
import { CdpClient } from '@coinbase/cdp-sdk';
import { BaseProvider } from './providers/BaseProvider';
import { WALLET_OWNER } from './constants';
import { WALLET_SMART_ACCOUNT } from './constants';
import { getRequestMaxCost } from 'services/PricingService';
import { Decimal } from 'generated/prisma/runtime/library';
import { PaymentRequiredResponseSchema, PaymentRequirementsSchema } from 'schema/x402';
import { USDC_ADDRESS } from 'services/fund-repo/constants';
import { chatCompletionsRequirements } from 'schema/accepts';
/**
 * USDC has 6 decimal places
 */
const USDC_DECIMALS = 6;
const USDC_MULTIPLIER = 10 ** USDC_DECIMALS;

/**
 * Converts a decimal amount (USD) to USDC BigInt representation
 * USDC has 6 decimal places, so $1.234567 becomes 1234567n
 * @param amount Decimal amount in USD
 * @returns BigInt representation for USDC
 */
export function decimalToUsdcBigInt(amount: Decimal | number): bigint {
  const numericAmount = typeof amount === 'number' ? amount : Number(amount);
  // Use Math.ceil for defensive rounding to avoid undercharging
  return BigInt(Math.ceil(numericAmount * USDC_MULTIPLIER));
}

/**
 * Converts USDC BigInt representation to decimal amount (USD)
 * @param usdcBigInt BigInt representation of USDC amount
 * @returns Decimal amount in USD
 */
export function usdcBigIntToDecimal(usdcBigInt: bigint | string): Decimal {
  const bigIntValue =
    typeof usdcBigInt === 'string' ? BigInt(usdcBigInt) : usdcBigInt;
  const decimalValue = Number(bigIntValue) / USDC_MULTIPLIER;
  return new Decimal(decimalValue);
}

export function parseX402Headers(
  headers: Record<string, string>
): ExactEvmPayloadAuthorization {
  return {
    from: headers['from'] as `0x${string}`,
    to: headers['to'] as `0x${string}`,
    value: headers['value'] as string,
    valid_after: Number(headers['valid_after'] as string),
    valid_before: Number(headers['valid_before'] as string),
    nonce: headers['nonce'] as `0x${string}`,
  };
}

// TODO: Alvaro is working on this.
// takes request and provider
export function alvaroInferenceCostEstimation(): string {
  return '1';
}

function buildX402Challenge(params: X402ChallengeParams): string {
  const esc = (value: string) => value.replace(/"/g, '\\"');
  return `X-402 realm=${esc(params.realm)}", link="${esc(params.link)}", network="${esc(params.network)}"`;
}

export function buildX402Response(res: Response, maxCost: Decimal) {
  const network = process.env.NETWORK as Network;
  // Convert maxCost from Decimal to USDC BigInt string for payment URL
  const maxCostBigInt = decimalToUsdcBigInt(maxCost);
  const paymentUrl = `${process.env.ECHO_ROUTER_BASE_URL}/api/v1/${network}/payment-link?amount=${encodeURIComponent(maxCostBigInt.toString())}`;

  res.setHeader(
    'WWW-Authenticate',
    buildX402Challenge({
      realm: 'echo',
      link: paymentUrl,
      network,
    })
  );

  const paymentRequiredResponse = PaymentRequiredResponseSchema.parse({
    x402Version: 1,
    error: 'Payment Required',
    accepts: [
      chatCompletionsRequirements(maxCostBigInt, paymentUrl),
    ],
  });

  return res.status(402).json(paymentRequiredResponse);
}

export function isApiRequest(headers: Record<string, string>): boolean {
  return headers['x-api-key'] !== undefined;
}

export function isX402Request(headers: Record<string, string>): boolean {
  return headers['x-402-challenge'] !== undefined;
}

export async function getSmartAccount(): Promise<{
  cdp: CdpClient;
  smartAccount: SmartAccount;
}> {
  const cdp = new CdpClient();
  const owner = await cdp.evm.getOrCreateAccount({
    name: WALLET_OWNER,
  });

  const smartAccount = await cdp.evm.getOrCreateSmartAccount({
    name: WALLET_SMART_ACCOUNT,
    owner,
  });
  return { cdp, smartAccount };
}
