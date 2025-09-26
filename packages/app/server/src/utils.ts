import { ExactEvmPayloadAuthorization, Network, X402ChallengeParams } from "types";
import { Response } from 'express';
import { SmartAccount } from "@coinbase/cdp-sdk/_types/client/evm/evm.types";
import { CdpClient } from "@coinbase/cdp-sdk";
import { WALLET_OWNER } from "./constants";
import { WALLET_SMART_ACCOUNT } from "./constants";
import { X402PaymentBody } from "./types";

export function parseX402Headers(headers: Record<string, string>): ExactEvmPayloadAuthorization {
    return {
        from: headers['from'] as `0x${string}`,
        to: headers['to'] as `0x${string}`,
        value: headers['value'] as string,
        valid_after: Number(headers['valid_after'] as string),
        valid_before: Number(headers['valid_before'] as string),
        nonce: headers['nonce'] as `0x${string}`,
    }
}

// TODO: Alvaro is working on this.
// takes request and provider
export function alvaroInferenceCostEstimation(): string {
  return "1";
}

function buildX402Challenge(params: X402ChallengeParams): string {
  console.log('params', params);
  const esc = (value: string) => value.replace(/"/g, '\\"');
  return `X-402 realm=${esc(params.realm)}", link="${esc(params.link)}", network="${esc(params.network)}"`
}

export async function buildX402Response(res: Response) {
  const network = process.env.NETWORK as Network;
  const costEstimation = alvaroInferenceCostEstimation();
  const paymentUrl = `${process.env.ECHO_ROUTER_BASE_URL}/api/v1/${network}/payment-link?amount=${encodeURIComponent(costEstimation)}`;

  res.setHeader(
    'WWW-Authenticate',
    buildX402Challenge({
      realm: 'echo',
      link: paymentUrl,
      network,
    })
  )

  const paymentBody: X402PaymentBody = {
      type: 'x402',
      url: paymentUrl,
      amount: costEstimation,
      network,
      to: (await getSmartAccount()).smartAccount.address,
  }

  return res.status(402).json({
    error: 'Payment Required',
    payment: paymentBody,
  })
}

export function isApiRequest(headers: Record<string, string>): boolean {
  return headers['x-api-key'] !== undefined;
}

export function isX402Request(headers: Record<string, string>): boolean {
  return headers['x-402-challenge'] !== undefined;
}

export async function getSmartAccount(): Promise<{cdp: CdpClient, smartAccount: SmartAccount}> {
    const cdp = new CdpClient();
    const owner = await cdp.evm.getOrCreateAccount({
        name: WALLET_OWNER,
    });

    const smartAccount = await cdp.evm.getOrCreateSmartAccount({
        name: WALLET_SMART_ACCOUNT,
        owner,
    });
    return {cdp, smartAccount};
}