import {
  ExactEvmPayloadAuthorization,
  Network,
  X402ChallengeParams,
} from 'types';
import { Request, Response } from 'express';
import { ok, err } from 'neverthrow';
import { AppResult, ConfigurationError, ValidationError } from './errors';
import { CdpClient, EvmSmartAccount } from '@coinbase/cdp-sdk';
import {
  WALLET_SMART_ACCOUNT,
  DOMAIN_NAME,
  X402_VERSION,
  X402_SCHEME,
  DISCOVERABLE,
  DOMAIN_VERSION,
  MAX_TIMEOUT_SECONDS,
  MIME_TYPE,
  ECHO_DESCRIPTION,
  WALLET_OWNER,
  X402_TYPE,
  X402_ERROR_MESSAGE,
  X402_PAYMENT_HEADER,
  X402_REALM,
  USDC_MULTIPLIER,
} from './constants';
import { Decimal } from './generated/prisma/runtime/library';
import { USDC_ADDRESS } from 'services/fund-repo/constants';
import crypto from 'crypto';
import logger from 'logger';

/**
 * USDC has 6 decimal places
 */
import {
  PaymentPayload,
  PaymentPayloadSchema,
} from './services/facilitator/x402-types';

import { getSchemaForRoute } from './schema/schemaForRoute';
import { getDescriptionForRoute } from './schema/descriptionForRoute';
import { env } from './env';
const API_KEY_ID = env.CDP_API_KEY_ID || 'your-api-key-id';
const API_KEY_SECRET = env.CDP_API_KEY_SECRET || 'your-api-key-secret';
const WALLET_SECRET = env.CDP_WALLET_SECRET || 'your-wallet-secret';
/**
 * Converts a decimal amount (USD) to USDC BigInt representation
 * USDC has 6 decimal places, so $1.234567 becomes 1234567n
 * @param amount Decimal amount in USD
 * @returns BigInt representation for USDC
 */
export function decimalToUsdcBigInt(amount: Decimal | number): bigint {
  const numericAmount = typeof amount === 'number' ? amount : Number(amount);
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

/**
 * Calculates the refund amount for an x402 request. Also used to log when we underestimate the cost.
 * @param maxCost The max cost of the request
 * @param transactionCost The cost of the transaction
 * @returns The refund amount
 */
export function calculateRefundAmount(
  maxCost: Decimal,
  transactionCost: Decimal
): Decimal {
  if (transactionCost.greaterThan(maxCost)) {
    logger.error(
      `Transaction cost (${transactionCost}) exceeds max cost (${maxCost}).`
    );
    return new Decimal(0);
  }
  return maxCost.minus(transactionCost);
}

/**
 * Generates a random nonce in hexadecimal format
 * @returns A random hex string with 0x prefix (25 bytes = 50 hex chars)
 */
function generateRandomNonce(): `0x${string}` {
  const bytes = crypto.randomBytes(32);
  return `0x${bytes.toString('hex')}` as `0x${string}`;
}

function parseX402Headers(
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

function buildX402Challenge(params: X402ChallengeParams): string {
  const esc = (value: string | undefined) => (value || '').replace(/"/g, '\\"');
  return `X-402 realm="${esc(params.realm)}", link="${esc(params.link)}", network="${esc(params.network)}"`;
}

export async function buildX402Response(
  req: Request,
  res: Response,
  maxCost: Decimal
) {
  const network = env.NETWORK as Network;
  const maxCostBigInt = decimalToUsdcBigInt(maxCost);
  const paymentUrl = req.path;
  const host = env.ECHO_ROUTER_BASE_URL;
  const resourceUrl = `${host}${req.url}`;

  const smartAccountResult = await getSmartAccount();
  if (smartAccountResult.isErr()) {
    logger.error('Failed to get smart account for X402 response', { 
      error: smartAccountResult.error 
    });
    return res.status(500).json({
      error: 'Failed to initialize payment system',
      type: smartAccountResult.error.type
    });
  }

  const recipient = smartAccountResult.value.smartAccount.address;

  res.setHeader(
    'WWW-Authenticate',
    buildX402Challenge({
      realm: X402_REALM,
      link: paymentUrl,
      network,
    })
  );

  let outputSchema;
  try {
    outputSchema = getSchemaForRoute(req.path);
    logger.info('Schema generated for route', {
      path: req.path,
      hasSchema: !!outputSchema,
    });
  } catch (error) {
    logger.error('Failed to generate schema for route', {
      path: req.path,
      error,
    });
    outputSchema = undefined;
  }

  const resBody = {
    x402Version: 1,
    error: X402_ERROR_MESSAGE,
    accepts: [
      {
        type: X402_TYPE,
        version: X402_VERSION,
        network,
        maxAmountRequired: maxCostBigInt.toString(),
        recipient: recipient,
        currency: USDC_ADDRESS,
        to: recipient,
        url: resourceUrl,
        nonce: generateRandomNonce(),
        scheme: X402_SCHEME,
        resource: resourceUrl,
        description: getDescriptionForRoute(req.path) ?? ECHO_DESCRIPTION,
        mimeType: MIME_TYPE,
        maxTimeoutSeconds: MAX_TIMEOUT_SECONDS,
        discoverable: DISCOVERABLE,
        payTo: recipient,
        asset: USDC_ADDRESS,
        extra: {
          name: DOMAIN_NAME,
          version: DOMAIN_VERSION,
        },
        ...(outputSchema ? { outputSchema: outputSchema } : {}),
      },
    ],
  };

  logger.info('Sending 402 response', { path: req.path });
  return res.status(402).json(resBody);
}

export function isApiRequest(headers: Record<string, string>): boolean {
  return (
    headers['x-api-key'] !== undefined ||
    headers['x-goog-api-key'] !== undefined ||
    headers['authorization'] !== undefined
  );
}

export function isX402Request(headers: Record<string, string>): boolean {
  return headers[X402_PAYMENT_HEADER] !== undefined;
}

export async function getSmartAccount(): Promise<AppResult<{
  smartAccount: EvmSmartAccount;
}, ConfigurationError>> {
  try {
    const cdp = new CdpClient({
      apiKeyId: API_KEY_ID,
      apiKeySecret: API_KEY_SECRET,
      walletSecret: WALLET_SECRET,
    });

    const owner = await cdp.evm.getOrCreateAccount({
      name: WALLET_OWNER,
    });

    const smartAccount = await cdp.evm.getOrCreateSmartAccount({
      name: WALLET_SMART_ACCOUNT,
      owner,
    });

    return ok({ smartAccount });
  } catch (error) {
    logger.error('Failed to get smart account', { error });
    return err(new ConfigurationError(
      `CDP authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'CDP_WALLET_CONFIG',
      { error: String(error) }
    ));
  }
}

export function validateXPaymentHeader(
  processedHeaders: Record<string, string>,
  req: Request
): AppResult<PaymentPayload, ValidationError> {
  const xPaymentHeader =
    processedHeaders[X402_PAYMENT_HEADER] || req.headers[X402_PAYMENT_HEADER];
  
  if (!xPaymentHeader) {
    logger.error('x-payment header missing');
    return err(new ValidationError('x-payment header missing after validation'));
  }
  
  try {
    const xPaymentData = JSON.parse(
      Buffer.from(xPaymentHeader as string, 'base64').toString()
    );
    
    const parseResult = PaymentPayloadSchema.safeParse(xPaymentData);
    if (!parseResult.success) {
      logger.error('Invalid payment payload', { error: parseResult.error });
      return err(new ValidationError('Invalid payment payload format'));
    }
    
    return ok(parseResult.data);
  } catch (error) {
    logger.error('Failed to parse x-payment header', { error });
    return err(new ValidationError('Failed to parse x-payment header'));
  }
}
