import { Sandbox } from '@e2b/code-interpreter';
import dotenv from 'dotenv';
import { E2BExecuteOutput, E2BExecuteInput } from './types';
import { DEFAULT_VCPU_COUNT, PRICE_PER_VCPU_PER_SECOND } from './prices';
import { Decimal } from '@prisma/client/runtime/library';
import { Transaction } from '../../types';
import { HttpError } from 'errors/http';
import { ResultAsync } from 'neverthrow';
dotenv.config();

export const calculateE2BExecuteCost = (): Decimal => {
  const estimatedDurationSeconds = 10;
  return new Decimal(
    estimatedDurationSeconds * PRICE_PER_VCPU_PER_SECOND * DEFAULT_VCPU_COUNT
  );
};

export const createE2BTransaction = (
  input: E2BExecuteInput,
  output: E2BExecuteOutput,
  cost: Decimal
): Transaction => {
  return {
    metadata: {
      providerId: output.sandboxId,
      provider: 'e2b',
      model: 'sandbox',
      inputTokens: output.duration,
      outputTokens: output.duration,
      totalTokens: output.duration,
      toolCost: cost,
    },
    rawTransactionCost: cost,
    status: 'completed',
  };
};

export const e2bExecutePythonSnippet = async (
  snippet: string
): Promise<E2BExecuteOutput> => {
  if (!process.env.E2B_API_KEY) {
    throw new Error('E2B_API_KEY environment variable is required but not set');
  }
  const startTime = performance.now();

  const result = await ResultAsync.fromPromise(
    Sandbox.create({
      apiKey: process.env.E2B_API_KEY,
    }),
    error => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new HttpError(400, `E2B API request failed: ${message}`);
    }
  ).andThen((sandbox: Sandbox) => {
    const sandboxId = sandbox.sandboxId;
    return ResultAsync.fromPromise<
      { results: any; logs: any; error?: any; executionCount?: any },
      HttpError
    >(
      sandbox.runCode(snippet, {
        timeoutMs: 10000,
        requestTimeoutMs: 15000,
      }),
      error => {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        return new HttpError(400, `E2B API request failed: ${message}`);
      }
    ).map(({ results, logs, error, executionCount }) => {
      const endTime = performance.now();
      const durationMs = endTime - startTime;
      const duration = durationMs / 1000;
      const cost = duration * PRICE_PER_VCPU_PER_SECOND * DEFAULT_VCPU_COUNT;
      // Ensure sandbox is killed; ignore any errors during kill
      void sandbox.kill().catch(() => undefined);
      return {
        results,
        logs,
        error,
        executionCount,
        cost,
        sandboxId,
        duration,
      } as E2BExecuteOutput;
    });
  });

  return result.match(
    (value: E2BExecuteOutput) => value,
    (error: HttpError) => {
      throw error;
    }
  );
};
