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
import { HttpError } from 'errors/http';
import { ResultAsync, ok, err } from 'neverthrow';
import type { ResourceError } from '../errors/results';

type ResourceHandlerConfig<TInput, TOutput> = {
  inputSchema: ZodSchema<TInput>;
  calculateMaxCost: (input?: TInput) => Decimal;
  executeResource: (input: TInput) => Promise<TOutput>;
  calculateActualCost: (input: TInput, output: TOutput) => Decimal;
  createTransaction: (input: TInput, output: TOutput, cost: Decimal) => any;
  errorMessage: string;
};

function handleApiRequest<TInput, TOutput>(
  parsedBody: TInput,
  headers: Record<string, string>,
  config: ResourceHandlerConfig<TInput, TOutput>
): ResultAsync<TOutput, ResourceError> {
  const { executeResource, calculateActualCost, createTransaction } = config;

  return ResultAsync.fromPromise(
    authenticateRequest(headers, prisma),
    (cause): ResourceError => ({ type: 'RESOURCE_AUTHENTICATION_FAILED', cause })
  ).andThen(({ echoControlService }) =>
    ResultAsync.fromPromise(
      executeResource(parsedBody),
      (cause): ResourceError => ({ type: 'RESOURCE_EXECUTION_FAILED', cause })
    ).andThen(output => {
      const actualCost = calculateActualCost(parsedBody, output);
      const transaction = createTransaction(parsedBody, output, actualCost);
      return ResultAsync.fromPromise(
        echoControlService.createTransaction(transaction),
        (cause): ResourceError => ({ type: 'RESOURCE_TRANSACTION_FAILED', cause })
      ).map(() => output);
    })
  );
}

function executeResourceWithRefund<TInput, TOutput>(
  parsedBody: TInput,
  executeResource: (input: TInput) => Promise<TOutput>,
  paymentAmountDecimal: Decimal,
  payload: ExactEvmPayload
): ResultAsync<TOutput, ResourceError> {
  return ResultAsync.fromPromise(
    executeResource(parsedBody),
    (cause): ResourceError => ({ type: 'RESOURCE_EXECUTION_FAILED', cause })
  ).mapErr(resourceErr => {
    // Attempt refund on execution failure; log but don't block the error propagation
    refund(paymentAmountDecimal, payload).mapErr(refundErr => {
      logger.error('Failed to refund after resource execution failure', refundErr);
    });
    return resourceErr;
  });
}

function handle402Request<TInput, TOutput>(
  req: Request,
  res: Response,
  parsedBody: TInput,
  headers: Record<string, string>,
  safeMaxCost: Decimal,
  config: ResourceHandlerConfig<TInput, TOutput>
): ResultAsync<TOutput, ResourceError> {
  const { executeResource, calculateActualCost, createTransaction } = config;

  return settle(req, headers, safeMaxCost)
    .mapErr((cause): ResourceError => ({ type: 'RESOURCE_PAYMENT_FAILED', cause }))
    .andThen(({ payload, paymentAmountDecimal }) =>
      executeResourceWithRefund(
        parsedBody,
        executeResource,
        paymentAmountDecimal,
        payload
      ).map(output => ({
        output,
        payload,
        paymentAmountDecimal,
      }))
    )
    .map(({ output, payload, paymentAmountDecimal }) => {
      const actualCost = calculateActualCost(parsedBody, output);
      const transaction = createTransaction(parsedBody, output, actualCost);

      finalizeResource(paymentAmountDecimal, transaction, payload).catch(error => {
        logger.error('Failed to finalize transaction', error);
      });

      return output;
    });
}

async function handleResourceRequest<TInput, TOutput>(
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
    return handleApiRequest(parsedBody, headers, config).match(
      output => res.status(200).json(output),
      error => {
        logger.error('Failed to handle API request', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    );
  }

  if (isX402Request(headers)) {
    return handle402Request(req, res, parsedBody, headers, safeMaxCost, config).match(
      result => res.status(200).json(result),
      error => {
        if (error.type === 'RESOURCE_PAYMENT_FAILED') {
          logger.error('Failed to handle 402 request: payment failed', error.cause);
          return buildX402Response(req, res, safeMaxCost);
        }
        logger.error('Failed to handle 402 request', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    );
  }

  return buildX402Response(req, res, safeMaxCost);
}

export async function handleResourceRequestWithErrorHandling<TInput, TOutput>(
  req: Request,
  res: Response,
  config: ResourceHandlerConfig<TInput, TOutput>
) {
  return ResultAsync.fromPromise(
    handleResourceRequest(req, res, config),
    (error): HttpError =>
      error instanceof HttpError
        ? error
        : new HttpError(500, config.errorMessage || 'Internal server error')
  ).match(
    result => result,
    (error: HttpError) => {
      logger.error(config.errorMessage, error);
      return res.status(error.statusCode).json({ error: config.errorMessage });
    }
  );
}
