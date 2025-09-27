import { SettleRequest, SettleResponse, VerifyRequest, VerifyResponse, X402Version } from "./types";
import { useFacilitator } from "x402/dist/cjs/verify"; // TODO: fix import

export class FacilitatorClient {

    // TODO: fix the type mess!
    async verify(request: VerifyRequest): Promise<VerifyResponse> {
        return await useFacilitator().verify({
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
    }

    // TODO: fix the type mess!
    async settle(request: SettleRequest): Promise<SettleResponse> {
        return await useFacilitator().settle({
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
}