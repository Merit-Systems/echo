import { toJsonSafe } from './toJsonSafe';
import {
  PaymentPayload,
  PaymentRequirements,
  SettleResponse,
  VerifyResponse,
} from './x402-types';
import { generateCdpJwt } from './facilitatorService';

const DEFAULT_FACILITATOR_URL = process.env.FACILITATOR_BASE_URL;
const FACILITATOR_METHOD_PREFIX = process.env.FACILITATOR_METHOD_PREFIX;
/**
 * Creates a facilitator client for interacting with the X402 payment facilitator service
 *
 * @returns An object containing verify and settle functions for interacting with the facilitator
 */
export function useFacilitator() {
  /**
   * Verifies a payment payload with the facilitator service
   *
   * @param payload - The payment payload to verify
   * @param paymentRequirements - The payment requirements to verify against
   * @returns A promise that resolves to the verification response
   */
  async function verify(
    payload: PaymentPayload,
    paymentRequirements: PaymentRequirements
  ): Promise<VerifyResponse> {
    const url = DEFAULT_FACILITATOR_URL;

    const jwt = await generateCdpJwt({
      requestMethod: 'POST',
      requestPath: `${FACILITATOR_METHOD_PREFIX}/verify`,
    });

    let headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    };

    const requestBody = {
      x402Version: 1,
      paymentPayload: toJsonSafe(payload),
      paymentRequirements: toJsonSafe(paymentRequirements),
    };

    const res = await fetch(`${url}${FACILITATOR_METHOD_PREFIX}/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (res.status !== 200) {
      const errorBody = await res.text();
      console.error('Verify failed - Status:', res.status);
      console.error('Verify failed - Response:', errorBody);
      throw new Error(
        `Failed to verify payment: ${res.status} ${res.statusText} - ${errorBody}`
      );
    }

    const data = await res.json();
    return data as VerifyResponse;
  }

  /**
   * Settles a payment with the facilitator service
   *
   * @param payload - The payment payload to settle
   * @param paymentRequirements - The payment requirements for the settlement
   * @returns A promise that resolves to the settlement response
   */
  async function settle(
    payload: PaymentPayload,
    paymentRequirements: PaymentRequirements
  ): Promise<SettleResponse> {
    const url = DEFAULT_FACILITATOR_URL;

    const jwt = await generateCdpJwt({
      requestMethod: 'POST',
      requestPath: `${FACILITATOR_METHOD_PREFIX}/settle`,
    });

    let headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    };

    const requestBody = {
      x402Version: 1,
      paymentPayload: toJsonSafe(payload),
      paymentRequirements: toJsonSafe(paymentRequirements),
    };

    const res = await fetch(`${url}${FACILITATOR_METHOD_PREFIX}/settle`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (res.status !== 200) {
      const errorBody = await res.text();
      console.error('Settle failed - Status:', res.status);
      console.error('Settle failed - Response:', errorBody);
      throw new Error(
        `Failed to settle payment: ${res.status} ${res.statusText} - ${errorBody}`
      );
    }

    const data = await res.json();
    return data as SettleResponse;
  }

  return { verify, settle };
}

export const { verify, settle } = useFacilitator();
