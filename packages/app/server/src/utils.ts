import {
  ExactEvmPayloadAuthorization,
  Network,
  X402ChallengeParams,
} from 'types';
import { Request, Response } from 'express';
import { CdpClient, EvmSmartAccount } from '@coinbase/cdp-sdk';
import { Result, ResultAsync, ok, err } from 'neverthrow';
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
import { Decimal } from 'generated/prisma/runtime/library';
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
const API_KEY_ID = process.env.CDP_API_KEY_ID || 'your-api-key-id';
const API_KEY_SECRET = process.env.CDP_API_KEY_SECRET || 'your-api-key-secret';
const WALLET_SECRET = process.env.CDP_WALLET_SECRET || 'your-wallet-secret';
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
export function generateRandomNonce(): `0x${string}` {
  const bytes = crypto.randomBytes(32);
  return `0x${bytes.toString('hex')}` as `0x${string}`;
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

function buildX402Challenge(params: X402ChallengeParams): string {
  const esc = (value: string | undefined) => (value || '').replace(/"/g, '\\"');
  return `X-402 realm="${esc(params.realm)}", link="${esc(params.link)}", network="${esc(params.network)}"`;
}

export function buildX402Response(
  req: Request,
  res: Response,
  maxCost: Decimal
): ResultAsync<Response, Error> {
  const network = process.env.NETWORK as Network;
  const maxCostBigInt = decimalToUsdcBigInt(maxCost);
  const paymentUrl = req.path;
  const host = process.env.ECHO_ROUTER_BASE_URL;
  const resourceUrl = `${host}${req.url}`;

  return getSmartAccount()
    .andThen(({ smartAccount }) => {
      const recipient = smartAccount.address;

      res.setHeader(
        'WWW-Authenticate',
        buildX402Challenge({
          realm: X402_REALM,
          link: paymentUrl,
          network,
        })
      );

      let outputSchema;
      const schemaResult = Result.fromThrowable(
        () => getSchemaForRoute(req.path),
        error =>
          new Error(
            `Failed to generate schema for route: ${error instanceof Error ? error.message : 'Unknown error'}`
          )
      )();

      if (schemaResult.isOk()) {
        outputSchema = schemaResult.value;
        logger.info('Schema generated for route', {
          path: req.path,
          hasSchema: !!outputSchema,
        });
      } else {
        logger.error('Failed to generate schema for route', {
          path: req.path,
          error: schemaResult.error,
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
      return ok(res.status(402).json(resBody));
    })
    .mapErr(error => {
      logger.error('Failed to get smart account for X402 response', { error });
      return error;
    });
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

export function getSmartAccount(): ResultAsync<
  {
    smartAccount: EvmSmartAccount;
  },
  Error
> {
  return ResultAsync.fromPromise(
    (async () => {
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

      return { smartAccount };
    })(),
    error => {
      logger.error('Failed to get smart account', { error });
      return new Error(
        `CDP authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  );
}

export function validateXPaymentHeader(
  processedHeaders: Record<string, string>,
  req: Request
): Result<PaymentPayload, Error> {
  const xPaymentHeader =
    processedHeaders[X402_PAYMENT_HEADER] || req.headers[X402_PAYMENT_HEADER];
  if (!xPaymentHeader) {
    return err(new Error('x-payment header missing after validation'));
  }

  try {
    const xPaymentData = JSON.parse(
      Buffer.from(xPaymentHeader as string, 'base64').toString()
    );
    const parsedData = PaymentPayloadSchema.parse(xPaymentData);
    return ok(parsedData);
  } catch (error) {
    return err(
      new Error(
        `Failed to parse x-payment header: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    );
  }
}
