import {
  SettleRequest,
  SettleResponse,
  VerifyResponse,
  VerifyRequest,
} from './x402-types';
import { verify as evmVerify, settle as evmSettle } from './evmFacilitator';
import logger from 'logger';

const verify = async (request: VerifyRequest): Promise<VerifyResponse> => {
  const { paymentPayload, paymentRequirements } = request;

  const network = paymentPayload.network;
  
  if (network.startsWith('solana')) {
    logger.error('SVM not yet supported in localFacilitator');
    return {
      isValid: false,
      invalidReason: 'unsupported_scheme',
      payer: undefined,
    };
  }

  const result = await evmVerify(paymentPayload, paymentRequirements);
  return result;
};

const settle = async (request: SettleRequest): Promise<SettleResponse> => {
  const { paymentPayload, paymentRequirements } = request;

  const network = paymentPayload.network;
  
  if (network.startsWith('solana')) {
    logger.error('SVM not yet supported in localFacilitator');
    return {
      success: false,
      errorReason: 'unsupported_scheme',
      payer: undefined,
      transaction: '',
      network: paymentPayload.network,
    };
  }

  const response = await evmSettle(paymentPayload, paymentRequirements);
  return response;
};

export const localFacilitator = {
  verify,
  settle,
};