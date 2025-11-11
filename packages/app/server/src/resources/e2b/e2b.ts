import { Sandbox } from '@e2b/code-interpreter';
import dotenv from 'dotenv';
import { E2BExecuteOutput, E2BExecuteInput } from './types';
import { DEFAULT_VCPU_COUNT, PRICE_PER_VCPU_PER_SECOND } from './prices';
import { Decimal } from '@prisma/client/runtime/library';
import { Transaction } from '../../types';
import { HttpError } from 'errors/http';
import { env } from '../../env';
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
  if (!env.E2B_API_KEY) {
    throw new Error('E2B_API_KEY environment variable is required but not set');
  }
  try {
    const startTime = performance.now();
    const sandbox = await Sandbox.create({
      apiKey: env.E2B_API_KEY,
    });
    const { results, logs, error, executionCount } = await sandbox.runCode(
      snippet,
      {
        timeoutMs: 10000,
        requestTimeoutMs: 15000,
      }
    );
    await sandbox.kill();
    const endTime = performance.now();
    const durationMs = endTime - startTime;
    const duration = durationMs / 1000;
    const cost = duration * PRICE_PER_VCPU_PER_SECOND * DEFAULT_VCPU_COUNT;
    return {
      results: results,
      logs: logs,
      error: error,
      executionCount: executionCount,
      cost: cost,
      sandboxId: sandbox.sandboxId,
      duration: duration,
    };
  } catch (error) {
    const errorText = error instanceof Error ? error.message : 'Unknown error';
    throw new HttpError(400, `E2B API request failed: ${errorText}`);
  }
};
