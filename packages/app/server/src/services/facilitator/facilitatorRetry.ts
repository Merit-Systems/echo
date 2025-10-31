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
import { localFacilitator } from './localFacilitator';

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
const facilitatorTimeout = process.env.FACILITATOR_REQUEST_TIMEOUT || 20000;

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
    url: PAYAI_FACILITATOR_BASE_URL!,
    methodPrefix: PAYAI_FACILITATOR_METHOD_PREFIX!,
    name: 'PayAI',
  },
  {
    url: X402RS_FACILITATOR_BASE_URL!,
    methodPrefix: X402RS_FACILITATOR_METHOD_PREFIX!,
    name: 'X402RS',
  },
  {
    url: '',
    methodPrefix: '',
    name: 'Local',
  },
];

/**
 * Executes a facilitator request with automatic fallover to backup facilitators
 *
 * @param method - The facilitator method to call ('verify' or 'settle')
 * @param payload - The payment payload
 * @param paymentRequirements - The payment requirements
 * @returns A promise that resolves to the facilitator response
 * @throws Error if all facilitators fail
 */
export async function facilitatorWithRetry<
  T extends VerifyResponse | SettleResponse,
>(
  method: FacilitatorMethod,
  payload: PaymentPayload,
  paymentRequirements: PaymentRequirements
): Promise<T> {
  const errors: Array<{ facilitator: string; error: string }> = [];

  logMetric('facilitator_attempt', 1, {
    method,
  });

  for (const facilitator of facilitators) {
    try {
      if (facilitator.name === 'Local') {
        const result = await localFacilitator[method]({
          paymentPayload: payload,
          paymentRequirements: paymentRequirements,
        });
        return result as T;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (facilitator.name === 'Coinbase') {
        const jwt = await generateCdpJwt({
          requestMethod: 'POST',
          requestPath: `${facilitator.methodPrefix}/${method}`,
        });
        headers.Authorization = `Bearer ${jwt}`;
      }

      const requestBody = {
        x402Version: 1,
        paymentPayload: toJsonSafe(payload),
        paymentRequirements: toJsonSafe(paymentRequirements),
      };

      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
        logger.warn(
          `Facilitator ${facilitator.name} ${method} request timed out after ${facilitatorTimeout}ms`
        );
      }, Number(facilitatorTimeout));

      const res = await fetch(
        `${facilitator.url}${facilitator.methodPrefix}/${method}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
          signal: abortController.signal,
        }
      );

      clearTimeout(timeoutId);

      if (res.status !== 200) {
        const errorBody = await res.text();
        const errorMsg = `${res.status} ${res.statusText} - ${errorBody}`;
        logMetric('facilitator_failure', 1, {
          facilitator: facilitator.name,
          method,
          status: res.status,
        });
        errors.push({ facilitator: facilitator.name, error: errorMsg });
        continue;
      }

      const data = await res.json();
      logger.info(`${facilitator.name} facilitator ${method} succeeded`, {
        facilitator: facilitator.name,
        method,
      });
      return data as T;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logMetric('facilitator_failure', 1, {
        facilitator: facilitator.name,
        method,
        error_type: 'exception',
      });
      errors.push({ facilitator: facilitator.name, error: errorMsg });
      continue;
    }
  }

  const errorDetails = errors
    .map(e => `${e.facilitator}: ${e.error.slice(0, 20)}`)
    .join('; ');
  throw new Error(`All facilitators failed for ${method}: ${errorDetails}`);
}
