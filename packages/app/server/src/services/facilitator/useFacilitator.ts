import {
  PaymentPayload,
  PaymentRequirements,
  SettleResponse,
  VerifyResponse,
} from './x402-types';
import { coinbaseFacilitator } from './coinbaseFacilitator';

/**
 * Creates a facilitator client for interacting with the X402 payment facilitator service
 * Uses Coinbase's facilitator API directly
 *
 * @returns An object containing verify and settle functions for interacting with the facilitator
 */
export function useFacilitator() {
  /**
   * Verifies a payment payload with the Coinbase facilitator service
   *
   * @param payload - The payment payload to verify
   * @param paymentRequirements - The payment requirements to verify against
   * @returns A promise that resolves to the verification response
   */
  async function verify(
    payload: PaymentPayload,
    paymentRequirements: PaymentRequirements
  ): Promise<VerifyResponse> {
    return coinbaseFacilitator<VerifyResponse>(
      'verify',
      payload,
      paymentRequirements
    );
  }

  /**
   * Settles a payment with the Coinbase facilitator service
   *
   * @param payload - The payment payload to settle
   * @param paymentRequirements - The payment requirements for the settlement
   * @returns A promise that resolves to the settlement response
   */
  async function settle(
    payload: PaymentPayload,
    paymentRequirements: PaymentRequirements
  ): Promise<SettleResponse> {
    return coinbaseFacilitator<SettleResponse>(
      'settle',
      payload,
      paymentRequirements
    );
  }

  return { verify, settle };
}
