import { toJsonSafe } from './toJsonSafe';
import {
  PaymentPayload,
  PaymentRequirements,
  SettleResponse,
  VerifyResponse,
} from './x402-types';
import logger, { logMetric } from '../../logger';
import dotenv from 'dotenv';
import { env } from '../../env';
import { FacilitatorProxyError } from '../../errors/http';

dotenv.config();

const PROXY_FACILITATOR_URL = env.PROXY_FACILITATOR_URL;
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
      `Proxy facilitator ${method} request timed out after ${timeoutMs}ms`
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
    logMetric('facilitator_proxy_failure', 1, {
      method,
      error: error instanceof Error ? error.message : 'unknown',
    });
    throw new FacilitatorProxyError();
  }
}

/**
 * Executes a facilitator request via the proxy router
 *
 * @param method - The facilitator method to call ('verify' or 'settle')
 * @param payload - The payment payload
 * @param paymentRequirements - The payment requirements
 * @returns A promise that resolves to the facilitator response
 * @throws Error if the request fails
 */
export async function facilitatorProxy<
  T extends VerifyResponse | SettleResponse,
>(
  method: FacilitatorMethod,
  payload: PaymentPayload,
  paymentRequirements: PaymentRequirements
): Promise<T> {

  if (!PROXY_FACILITATOR_URL) {
    throw new Error('PROXY_FACILITATOR_URL is not set');
  }


  logMetric('facilitator_proxy_attempt', 1, {
    method,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const requestBody = {
    x402Version: 1,
    paymentPayload: toJsonSafe(payload),
    paymentRequirements: toJsonSafe(paymentRequirements),
  };

  const res = await fetchWithTimeout(
    `${PROXY_FACILITATOR_URL}/${method}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    },
    facilitatorTimeout,
    method
  );

  if (res.status !== 200) {
    logMetric('facilitator_proxy_failure', 1, {
      method,
      status: res.status,
    });
    throw new FacilitatorProxyError();
  }

  const data = await res.json();
  logger.info(`Proxy facilitator ${method} succeeded`, {
    method,
  });
  logMetric('facilitator_proxy_success', 1, {
    method,
  });

  return data as T;
}
