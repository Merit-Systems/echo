import { Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';
import { buildX402Response, isApiRequest, isX402Request } from 'utils';
import { authenticateRequest } from 'auth';
import { prisma } from 'server';
import { settle } from 'handlers/settle';
import { finalizeResource } from 'handlers/finalize';
import { refund } from 'handlers/refund';
import logger from 'logger';
import { ExactEvmPayload } from 'services/facilitator/x402-types';
import { HttpError, PaymentRequiredError } from 'errors/http';

type ResourceHandlerConfig<TInput, TOutput> = {
  inputSchema: ZodSchema<TInput>;
  calculateMaxCost: (input?: TInput) => Decimal;
  executeResource: (input: TInput) => Promise<TOutput>;
  calculateActualCost: (input: TInput, output: TOutput) => Decimal;
  createTransaction: (input: TInput, output: TOutput, cost: Decimal) => any;
  errorMessage: string;
};

async function handleApiRequest<TInput, TOutput>(
  parsedBody: TInput,
  headers: Record<string, string>,
  config: ResourceHandlerConfig<TInput, TOutput>
) {
  const { executeResource, calculateActualCost, createTransaction } = config;

  const { echoControlService } = await authenticateRequest(headers, prisma);

  const output = await executeResource(parsedBody);

  const actualCost = calculateActualCost(parsedBody, output);
  const transaction = createTransaction(parsedBody, output, actualCost);

  await echoControlService.createTransaction(transaction);

  return output;
}

async function handle402Request<TInput, TOutput>(
  req: Request,
  res: Response,
  parsedBody: TInput,
  headers: Record<string, string>,
  safeMaxCost: Decimal,
  config: ResourceHandlerConfig<TInput, TOutput>
): Promise<TOutput> {
  const { executeResource, calculateActualCost, createTransaction } = config;

  const settleResult = await settle(req, res, headers, safeMaxCost);
  if (!settleResult) {
    throw new PaymentRequiredError('Payment required, settle failed');
  }

  const { payload, paymentAmountDecimal } = settleResult;

  const output = await executeResourceWithRefund(
    parsedBody,
    executeResource,
    paymentAmountDecimal,
    payload
  );

  const actualCost = calculateActualCost(parsedBody, output);
  const transaction = createTransaction(parsedBody, output, actualCost);

  finalizeResource(paymentAmountDecimal, transaction, payload).catch(error => {
    logger.error('Failed to finalize transaction', error);
  });

  return output;
}

async function executeResourceWithRefund<TInput, TOutput>(
  parsedBody: TInput,
  executeResource: (input: TInput) => Promise<TOutput>,
  paymentAmountDecimal: Decimal,
  payload: ExactEvmPayload
): Promise<TOutput> {
  try {
    const output = await executeResource(parsedBody);
    return output;
  } catch (error) {
    await refund(paymentAmountDecimal, payload);
    throw error;
  }
}

export async function handleResourceRequest<TInput, TOutput>(
  req: Request,
  res: Response,
  config: ResourceHandlerConfig<TInput, TOutput>
) {
  const { inputSchema, calculateMaxCost } = config;

  const headers = req.headers as Record<string, string>;

  const inputBody = inputSchema.safeParse(req.body);
  const maxCost = calculateMaxCost(inputBody.data);

  if (!isApiRequest(headers) && !isX402Request(headers)) {
    return buildX402Response(req, res, maxCost);
  }

  if (!inputBody.success) {
    return res
      .status(400)
      .json({ error: 'Invalid body', issues: inputBody.error.issues });
  }

  const parsedBody = inputBody.data;
  const safeMaxCost = calculateMaxCost(parsedBody);

  if (isApiRequest(headers)) {
    try {
      const output = await handleApiRequest(parsedBody, headers, config);
      return res.status(200).json(output);
    } catch (error) {
      logger.error('Failed to handle API request', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (isX402Request(headers)) {
    try {
      const result = await handle402Request(
        req,
        res,
        parsedBody,
        headers,
        safeMaxCost,
        config
      );
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof PaymentRequiredError) {
        logger.error('Failed to handle 402 request', error);
        return buildX402Response(req, res, safeMaxCost);
      }
      logger.error('Failed to handle 402 request', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return buildX402Response(req, res, safeMaxCost);
}

export async function handleResourceRequestWithErrorHandling<TInput, TOutput>(
  req: Request,
  res: Response,
  config: ResourceHandlerConfig<TInput, TOutput>
) {
  try {
    return await handleResourceRequest(req, res, config);
  } catch (error) {
    const { errorMessage } = config;
    if (error instanceof HttpError) {
      logger.error(errorMessage, error);
      return res.status(error.statusCode).json({ error: errorMessage });
    }
    logger.error(errorMessage, error);
    return res
      .status(500)
      .json({ error: errorMessage || 'Internal server error' });
  }
}
