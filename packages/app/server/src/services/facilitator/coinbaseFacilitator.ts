import {
  PaymentPayload,
  PaymentRequirements,
  SettleResponse,
  VerifyResponse,
} from './x402-types';
import { toJsonSafe } from './toJsonSafe';
import logger, { logMetric } from '../../logger';
import { env } from '../../env';
import { generateCdpJwt } from './facilitatorService';

const DEFAULT_FACILITATOR_URL =
  env.COINBASE_FACILITATOR_BASE_URL || 'https://api.cdp.coinbase.com';
const facilitatorTimeout = env.FACILITATOR_REQUEST_TIMEOUT || 20000;

type FacilitatorMethod = 'verify' | 'settle';

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
  method: FacilitatorMethod
): Promise<Response> {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
    logger.warn(
      `Coinbase facilitator ${method} request timed out after ${timeoutMs}ms`
    );
  }, Number(timeoutMs));

  try {
    const res = await fetch(url, {
      ...options,
      signal: abortController.signal,
    });
    clearTimeout(timeoutId);
    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    logMetric('coinbase_facilitator_failure', 1, {
      method,
      error: error instanceof Error ? error.message : 'unknown',
    });
    throw error;
  }
}

/**
 * Executes a facilitator request directly to Coinbase's facilitator API
 *
 * @param method - The facilitator method to call ('verify' or 'settle')
 * @param payload - The payment payload
 * @param paymentRequirements - The payment requirements
 * @returns A promise that resolves to the facilitator response
 * @throws Error if the request fails
 */
export async function coinbaseFacilitator<
  T extends VerifyResponse | SettleResponse,
>(
  method: FacilitatorMethod,
  payload: PaymentPayload,
  paymentRequirements: PaymentRequirements
): Promise<T> {
  if (!env.CDP_API_KEY_ID || !env.CDP_API_KEY_SECRET) {
    throw new Error(
      'CDP_API_KEY_ID and CDP_API_KEY_SECRET must be set to use Coinbase facilitator'
    );
  }

  logMetric('coinbase_facilitator_attempt', 1, {
    method,
  });

  const url = DEFAULT_FACILITATOR_URL;
  const requestPath = `/platform/v2/x402/${method}`;
  const jwt = await generateCdpJwt({
    requestMethod: 'POST',
    requestPath,
    requestHost: 'api.cdp.coinbase.com',
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwt}`,
  };

  const requestBody = {
    x402Version: 1,
    paymentPayload: toJsonSafe(payload),
    paymentRequirements: toJsonSafe(paymentRequirements),
  };

  const res = await fetchWithTimeout(
    `${url}${requestPath}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    },
    facilitatorTimeout,
    method
  );

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    logger.error(`Coinbase facilitator ${method} failed`, {
      method,
      status: res.status,
      error: errorText,
    });
    logMetric('coinbase_facilitator_failure', 1, {
      method,
      status: res.status,
    });
    throw new Error(
      `Coinbase facilitator ${method} failed: ${res.status} ${errorText}`
    );
  }

  const data = await res.json();
  logger.info(`Coinbase facilitator ${method} succeeded`, {
    method,
  });
  logMetric('coinbase_facilitator_success', 1, {
    method,
  });

  return data as T;
}
