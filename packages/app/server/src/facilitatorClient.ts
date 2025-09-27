import { SettleRequest, SettleResponse, VerifyRequest, VerifyResponse, X402Version } from "./types";
import { facilitator } from "@coinbase/x402";
import { useFacilitator } from "x402/verify";
import { generateJwt } from "@coinbase/cdp-sdk/auth";
import { env } from "process";

interface GenerateCdpJwtInput {
  requestMethod: "POST" | "GET" | "PUT" | "DELETE";
  requestHost?: string;
  requestPath: string;
  expiresIn?: number;
}

export const generateCdpJwt = async ({
  requestMethod,
  requestPath,
  requestHost = "api.cdp.coinbase.com",
  expiresIn = 1200000000,
}: GenerateCdpJwtInput) => {
  return await generateJwt({
    apiKeyId: process.env.CDP_API_KEY_ID!,
    apiKeySecret: process.env.CDP_API_KEY_SECRET!,
    requestMethod,
    requestHost,
    requestPath,
    expiresIn,
  });
};

export class FacilitatorClient {

    async verify(request: VerifyRequest): Promise<VerifyResponse> {
        const result = await useFacilitator(facilitator).verify({
            scheme: "exact",
            network: request.payment_requirements.network,
            x402Version: Number(X402Version.V1),
            payload: {
                signature: request.payment_payload.payload.signature,
                authorization: {
                    from: request.payment_payload.payload.authorization.from,
                    to: request.payment_payload.payload.authorization.to,
                    value: request.payment_payload.payload.authorization.value,
                    validAfter: request.payment_payload.payload.authorization.valid_after.toString(),
                    validBefore: request.payment_payload.payload.authorization.valid_before.toString(),
                    nonce: request.payment_payload.payload.authorization.nonce,
                },
            },
        }, {
            scheme: "exact",
            network: request.payment_requirements.network,
            maxAmountRequired: request.payment_requirements.max_amount_required,
            mimeType: request.payment_requirements.mime_type,
            description: request.payment_requirements.description,
            resource: request.payment_requirements.resource,
            asset: request.payment_requirements.asset,
            payTo: request.payment_requirements.pay_to,
            maxTimeoutSeconds: request.payment_requirements.max_timeout_seconds,
        });
        return result.payer
            ? { isValid: result.isValid, transaction_id: result.payer }
            : { isValid: result.isValid };
    }

    // this could fail for a million reasons and the cdp facilitator does not tell you why
    async settle(request: SettleRequest): Promise<SettleResponse> {
        console.log('settle', request);
        const jwt = await generateCdpJwt({
            requestMethod: "POST",
            requestPath: "/platform/v2/x402/settle",
        });
        console.log('jwt', jwt);
        const result = await useFacilitator(facilitator).settle({
            scheme: "exact",
            network: request.payment_requirements.network,
            x402Version: Number(X402Version.V1),
            payload: {
                signature: request.payment_payload.payload.signature,
                authorization: {
                    from: request.payment_payload.payload.authorization.from,
                    to: request.payment_payload.payload.authorization.to,
                    value: request.payment_payload.payload.authorization.value,
                    validAfter: request.payment_payload.payload.authorization.valid_after.toString(),
                    validBefore: request.payment_payload.payload.authorization.valid_before.toString(),
                    nonce: request.payment_payload.payload.authorization.nonce,
                },
            },
        }, {
            scheme: "exact",
            network: request.payment_requirements.network,
            maxAmountRequired: request.payment_requirements.max_amount_required,
            mimeType: request.payment_requirements.mime_type,
            description: request.payment_requirements.description,
            resource: request.payment_requirements.resource,
            asset: request.payment_requirements.asset,
            payTo: request.payment_requirements.pay_to,
            maxTimeoutSeconds: request.payment_requirements.max_timeout_seconds,
        });
        console.log('settle result', result);
        return result.payer
            ? { transaction: result.transaction, transaction_id: result.payer }
            : { transaction: result.transaction };
    }
}