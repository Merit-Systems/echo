import { toJsonSafe } from './toJsonSafe';
import {
  PaymentPayload,
  PaymentRequirements,
  SettleResponse,
  VerifyResponse,
} from './x402-types';
import { generateCdpJwt } from './facilitatorService';
import logger, { logMetric } from '../../logger';
import dotenv from 'dotenv';
import { ResultAsync, fromPromise, ok, err } from 'neverthrow';

dotenv.config();

const COINBASE_FACILITATOR_BASE_URL = process.env.COINBASE_FACILITATOR_BASE_URL;
const COINBASE_FACILITATOR_METHOD_PREFIX =
  process.env.COINBASE_FACILITATOR_METHOD_PREFIX;
const X402RS_FACILITATOR_BASE_URL = process.env.X402RS_FACILITATOR_BASE_URL;
const X402RS_FACILITATOR_METHOD_PREFIX =
  process.env.X402RS_FACILITATOR_METHOD_PREFIX;
const PAYAI_FACILITATOR_BASE_URL = process.env.PAYAI_FACILITATOR_BASE_URL;
const PAYAI_FACILITATOR_METHOD_PREFIX =
  process.env.PAYAI_FACILITATOR_METHOD_PREFIX;

type FacilitatorMethod = 'verify' | 'settle';

interface FacilitatorConfig {
  url: string;
  methodPrefix: string;
  name: string;
}

const facilitators: FacilitatorConfig[] = [
  {
    url: COINBASE_FACILITATOR_BASE_URL!,
    methodPrefix: COINBASE_FACILITATOR_METHOD_PREFIX!,
    name: 'Coinbase',
  },
  {
    url: X402RS_FACILITATOR_BASE_URL!,
    methodPrefix: X402RS_FACILITATOR_METHOD_PREFIX!,
    name: 'X402RS',
  },
  {
    url: PAYAI_FACILITATOR_BASE_URL!,
    methodPrefix: PAYAI_FACILITATOR_METHOD_PREFIX!,
    name: 'PayAI',
  },
];

/**
 * Executes a facilitator request with automatic fallover to backup facilitators
 *
 * @param method - The facilitator method to call ('verify' or 'settle')
 * @param payload - The payment payload
 * @param paymentRequirements - The payment requirements
 * @returns A ResultAsync that resolves to the facilitator response or an error
 */
export function facilitatorWithRetry<T extends VerifyResponse | SettleResponse>(
  method: FacilitatorMethod,
  payload: PaymentPayload,
  paymentRequirements: PaymentRequirements
): ResultAsync<T, Error> {
  return ResultAsync.fromSafePromise(
    (async (): Promise<T> => {
      const errors: Array<{ facilitator: string; error: string }> = [];

      for (const facilitator of facilitators) {
        const result = await attemptFacilitatorRequest<T>(
          facilitator,
          method,
          payload,
          paymentRequirements
        );

        if (result.isOk()) {
          return result.value;
        }

        // Log the error and continue to next facilitator
        const error = result.error;
        logger.error(`${facilitator.name} facilitator ${method} failed`, {
          facilitator: facilitator.name,
          method,
          error: error.message,
        });
        logMetric('facilitator_failure', 1, {
          facilitator: facilitator.name,
          method,
          error_type: error.name,
        });
        errors.push({ facilitator: facilitator.name, error: error.message });
      }

      const errorDetails = errors
        .map(e => `${e.facilitator}: ${e.error}`)
        .join('; ');
      throw new Error(`All facilitators failed for ${method}: ${errorDetails}`);
    })()
  );
}

/**
 * Attempts a single facilitator request
 */
function attemptFacilitatorRequest<T extends VerifyResponse | SettleResponse>(
  facilitator: FacilitatorConfig,
  method: FacilitatorMethod,
  payload: PaymentPayload,
  paymentRequirements: PaymentRequirements
): ResultAsync<T, Error> {
  return ResultAsync.fromSafePromise(
    (async (): Promise<T> => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (facilitator.name === 'Coinbase') {
        const jwtResult = await fromPromise(
          generateCdpJwt({
            requestMethod: 'POST',
            requestPath: `${facilitator.methodPrefix}/${method}`,
          }),
          error => new Error(`Failed to generate JWT: ${error}`)
        );

        if (jwtResult.isErr()) {
          throw jwtResult.error;
        }

        headers.Authorization = `Bearer ${jwtResult.value}`;
      }

      const requestBody = {
        x402Version: 1,
        paymentPayload: toJsonSafe(payload),
        paymentRequirements: toJsonSafe(paymentRequirements),
      };

      const fetchResult = await fromPromise(
        fetch(`${facilitator.url}${facilitator.methodPrefix}/${method}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
        }),
        error => new Error(`Network error: ${error}`)
      );

      if (fetchResult.isErr()) {
        throw fetchResult.error;
      }

      const res = fetchResult.value;

      if (res.status !== 200) {
        const textResult = await fromPromise(
          res.text(),
          error => new Error(`Failed to read error response: ${error}`)
        );

        if (textResult.isErr()) {
          throw textResult.error;
        }

        const errorBody = textResult.value;
        const errorMsg = `${res.status} ${res.statusText} - ${errorBody}`;
        throw new Error(errorMsg);
      }

      const jsonResult = await fromPromise(
        res.json(),
        error => new Error(`Failed to parse JSON response: ${error}`)
      );

      if (jsonResult.isErr()) {
        throw jsonResult.error;
      }

      logger.info(`${facilitator.name} facilitator ${method} succeeded`, {
        facilitator: facilitator.name,
        method,
      });

      return jsonResult.value as T;
    })()
  );
}
