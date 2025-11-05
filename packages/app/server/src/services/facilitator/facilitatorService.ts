import {
  SettleRequest,
  SettleResponse,
  VerifyRequest,
  VerifyResponse,
} from './x402-types';
import { generateJwt } from '@coinbase/cdp-sdk/auth';
import { useFacilitator } from './useFacilitator';
import { env } from '../../env';

interface GenerateCdpJwtInput {
  requestMethod: 'POST' | 'GET' | 'PUT' | 'DELETE';
  requestHost?: string;
  requestPath: string;
  expiresIn?: number;
}

const generateCdpJwt = async ({
  requestMethod,
  requestPath,
  requestHost = 'api.cdp.coinbase.com',
  expiresIn = 1200000000,
}: GenerateCdpJwtInput) => {
  return await generateJwt({
    apiKeyId: env.CDP_API_KEY_ID!,
    apiKeySecret: env.CDP_API_KEY_SECRET!,
    requestMethod,
    requestHost,
    requestPath,
    expiresIn,
  });
};

export class FacilitatorClient {
  async verify(request: VerifyRequest): Promise<VerifyResponse> {
    const result = await useFacilitator().verify(
      request.paymentPayload,
      request.paymentRequirements
    );
    return result;
  }

  async settle(request: SettleRequest): Promise<SettleResponse> {
    const result = await useFacilitator().settle(
      request.paymentPayload,
      request.paymentRequirements
    );
    return result;
  }
}
