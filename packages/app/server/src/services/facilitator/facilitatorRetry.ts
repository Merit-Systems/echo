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

dotenv.config();



const COINBASE_FACILITATOR_BASE_URL = process.env.COINBASE_FACILITATOR_BASE_URL;
const COINBASE_FACILITATOR_METHOD_PREFIX = process.env.COINBASE_FACILITATOR_METHOD_PREFIX;
const X402RS_FACILITATOR_BASE_URL = process.env.X402RS_FACILITATOR_BASE_URL;
const X402RS_FACILITATOR_METHOD_PREFIX = process.env.X402RS_FACILITATOR_METHOD_PREFIX;
const PAYAI_FACILITATOR_BASE_URL = process.env.PAYAI_FACILITATOR_BASE_URL;
const PAYAI_FACILITATOR_METHOD_PREFIX = process.env.PAYAI_FACILITATOR_METHOD_PREFIX;

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
 * @returns A promise that resolves to the facilitator response
 * @throws Error if all facilitators fail
 */
export async function facilitatorWithRetry<T extends VerifyResponse | SettleResponse>(
  method: FacilitatorMethod,
  payload: PaymentPayload,
  paymentRequirements: PaymentRequirements
): Promise<T> {

  const errors: Array<{ facilitator: string; error: string }> = [];

  for (const facilitator of facilitators) {
    try {
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

      const res = await fetch(`${facilitator.url}${facilitator.methodPrefix}/${method}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (res.status !== 200) {
        const errorBody = await res.text();
        const errorMsg = `${res.status} ${res.statusText} - ${errorBody}`;
        logger.error(`${facilitator.name} facilitator ${method} failed - Status: ${res.status}`, {
          facilitator: facilitator.name,
          method,
          status: res.status,
          errorBody,
        });
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
      logger.error(`${facilitator.name} facilitator ${method} threw exception`, {
        facilitator: facilitator.name,
        method,
        error: errorMsg,
      });
      logMetric('facilitator_failure', 1, {
        facilitator: facilitator.name,
        method,
        error_type: 'exception',
      });
      errors.push({ facilitator: facilitator.name, error: errorMsg });
      continue;
    }
  }

  const errorDetails = errors.map(e => `${e.facilitator}: ${e.error}`).join('; ');
  throw new Error(
    `All facilitators failed for ${method}: ${errorDetails}`
  );
}

