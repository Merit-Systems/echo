import { Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { Decimal } from '@prisma/client/runtime/library';
import { buildX402Response, isApiRequest, isX402Request } from 'utils';
import { authenticateRequest } from 'auth';
import { prisma } from 'server';
import { settle, finalize, refund } from 'handlers';
import logger from 'logger';
import { ExactEvmPayload } from 'services/facilitator/x402-types';
import { HttpError, PaymentRequiredError } from 'errors/http';
import { ResultAsync, fromPromise, ok, err } from 'neverthrow';

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
): ResultAsync<TOutput, Error> {
  const { executeResource, calculateActualCost, createTransaction } = config;

  return fromPromise(
    authenticateRequest(headers, prisma),
    error => error as Error
  ).andThen(({ echoControlService }) =>
    fromPromise(executeResource(parsedBody), error => error as Error).andThen(
      output => {
        const actualCost = calculateActualCost(parsedBody, output);
        const transaction = createTransaction(parsedBody, output, actualCost);

        return fromPromise(
          echoControlService.createTransaction(transaction, actualCost),
          error => error as Error
        ).map(() => output);
      }
    )
  );
}

function handle402Request<TInput, TOutput>(
  req: Request,
  res: Response,
  parsedBody: TInput,
  headers: Record<string, string>,
  safeMaxCost: Decimal,
  config: ResourceHandlerConfig<TInput, TOutput>
): ResultAsync<TOutput, Error> {
  const { executeResource, calculateActualCost, createTransaction } = config;

  return fromPromise(
    settle(req, res, headers, safeMaxCost),
    error => error as Error
  )
    .andThen(settleResult => {
      if (!settleResult) {
        return err(new PaymentRequiredError('Payment required, settle failed'));
      }
      return ok(settleResult);
    })
    .andThen(({ payload, paymentAmountDecimal }) =>
      executeResourceWithRefund(
        parsedBody,
        executeResource,
        paymentAmountDecimal,
        payload
      ).andThen(output => {
        const actualCost = calculateActualCost(parsedBody, output);
        const transaction = createTransaction(parsedBody, output, actualCost);

        finalize(paymentAmountDecimal, transaction, payload).catch(error => {
          logger.error('Failed to finalize transaction', error);
        });

        return ok(output);
      })
    );
}

function executeResourceWithRefund<TInput, TOutput>(
  parsedBody: TInput,
  executeResource: (input: TInput) => Promise<TOutput>,
  paymentAmountDecimal: Decimal,
  payload: ExactEvmPayload
): ResultAsync<TOutput, Error> {
  return fromPromise(
    executeResource(parsedBody),
    error => error as Error
  ).orElse(error =>
    fromPromise(refund(paymentAmountDecimal, payload), e => e as Error).andThen(
      () => err(error)
    )
  );
}

export async function handleResourceRequest<TInput, TOutput>(
  req: Request,
  res: Response,
  config: ResourceHandlerConfig<TInput, TOutput>
): Promise<void> {
  const { inputSchema, calculateMaxCost } = config;

  const headers = req.headers as Record<string, string>;

  const inputBody = inputSchema.safeParse(req.body);
  const maxCost = calculateMaxCost(inputBody.data);

  if (!isApiRequest(headers) && !isX402Request(headers)) {
    buildX402Response(req, res, maxCost);
    return;
  }

  if (!inputBody.success) {
    res
      .status(400)
      .json({ error: 'Invalid body', issues: inputBody.error.issues });
    return;
  }

  const parsedBody = inputBody.data;
  const safeMaxCost = calculateMaxCost(parsedBody);

  if (isApiRequest(headers)) {
    const result = await handleApiRequest(parsedBody, headers, config);
    result.match(
      output => res.status(200).json(output),
      error => {
        logger.error('Failed to handle API request', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    );
    return;
  }

  if (isX402Request(headers)) {
    const result = await handle402Request(
      req,
      res,
      parsedBody,
      headers,
      safeMaxCost,
      config
    );
    result.match(
      result => res.status(200).json(result),
      error => {
        if (error instanceof PaymentRequiredError) {
          logger.error('Failed to handle 402 request', error);
          buildX402Response(req, res, safeMaxCost);
        } else {
          logger.error('Failed to handle 402 request', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    );
    return;
  }

  buildX402Response(req, res, safeMaxCost);
}

export async function handleResourceRequestWithErrorHandling<TInput, TOutput>(
  req: Request,
  res: Response,
  config: ResourceHandlerConfig<TInput, TOutput>
): Promise<void> {
  const { errorMessage } = config;

  try {
    await handleResourceRequest(req, res, config);
  } catch (error) {
    if (error instanceof HttpError) {
      logger.error(errorMessage, error);
      res.status(error.statusCode).json({ error: errorMessage });
    } else {
      logger.error(errorMessage, error);
      res.status(500).json({ error: errorMessage || 'Internal server error' });
    }
  }
}
