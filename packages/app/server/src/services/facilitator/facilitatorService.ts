import {
  SettleRequest,
  SettleResponse,
  VerifyRequest,
  VerifyResponse,
} from './x402-types';
import { generateJwt } from '@coinbase/cdp-sdk/auth';
import { useFacilitator } from './useFacilitator';
import { ResultAsync } from 'neverthrow';

interface GenerateCdpJwtInput {
  requestMethod: 'POST' | 'GET' | 'PUT' | 'DELETE';
  requestHost?: string;
  requestPath: string;
  expiresIn?: number;
}

export const generateCdpJwt = async ({
  requestMethod,
  requestPath,
  requestHost = 'api.cdp.coinbase.com',
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
  verify(request: VerifyRequest): ResultAsync<VerifyResponse, Error> {
    return useFacilitator().verify(
      request.paymentPayload,
      request.paymentRequirements
    );
  }

  settle(request: SettleRequest): ResultAsync<SettleResponse, Error> {
    return useFacilitator().settle(
      request.paymentPayload,
      request.paymentRequirements
    );
  }
}
