import {
  type ErrorResponse,
  type CreateEmailOptions,
  type CreateEmailRequestOptions,
} from 'resend';
import { randomUUID } from 'crypto';
import { emailClient } from './client';
import { env } from '@/env';

export function sendEmailWithRetry(
  payload: Omit<CreateEmailOptions, 'from'>,
  options?: CreateEmailRequestOptions,
  config?: Partial<RetryConfig>
) {
  // Skip email sending if not in production environment
  if (!emailClient || !env.AUTH_RESEND_FROM_EMAIL) {
    console.log(
      '[Email Skipped - Not in Production] Would have sent email:',
      payload
    );
    return Promise.resolve({
      data: { id: 'skipped-not-in-production' },
      error: null,
    } as ResendResult<{ id: string }>);
  }

  const idempotencyKey = options?.idempotencyKey ?? randomUUID();
  const stableOptions: CreateEmailRequestOptions = {
    ...options,
    idempotencyKey,
  };

  const fromEmail = env.AUTH_RESEND_FROM_EMAIL;
  const client = emailClient; // TypeScript refinement

  return resendRetry(
    () =>
      client.emails.send(
        {
          ...payload,
          from: `Sam Ragsdale <${fromEmail}>` as const,
        } as CreateEmailOptions,
        stableOptions
      ),
    config
  );
}

type ResendResult<T> =
  | { data: T; error: null }
  | { data: null; error: ErrorResponse };

type RetryConfig = {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  factor: number;
  jitterRatio: number; // 0..1, proportion of jitter
};

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 6,
  initialDelayMs: 700,
  maxDelayMs: 8000,
  factor: 2,
  jitterRatio: 0.25,
};

const RETRYABLE_ERROR_NAMES: ReadonlySet<ErrorResponse['name']> = new Set([
  'rate_limit_exceeded',
  'internal_server_error',
  'application_error',
  'concurrent_idempotent_requests',
]);

function isRetryable(error: ErrorResponse): boolean {
  return RETRYABLE_ERROR_NAMES.has(error.name);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function computeBackoffDelayMs(attemptIndex: number, cfg: RetryConfig): number {
  const exp = cfg.initialDelayMs * Math.pow(cfg.factor, attemptIndex);
  const capped = Math.min(exp, cfg.maxDelayMs);
  const jitterAmplitude = capped * cfg.jitterRatio;
  const jitter = (Math.random() * 2 - 1) * jitterAmplitude;
  return Math.max(0, Math.round(capped + jitter));
}

async function resendRetry<T>(
  operation: () => Promise<ResendResult<T>>,
  config?: Partial<RetryConfig>
): Promise<ResendResult<T>> {
  const cfg: RetryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };

  let lastError: ErrorResponse | null = null;

  for (let attempt = 0; attempt < cfg.maxAttempts; attempt++) {
    const { data, error } = await operation();

    if (error === null) {
      return { data, error };
    }

    lastError = error;

    if (!isRetryable(lastError) || attempt === cfg.maxAttempts - 1) {
      return { data: null, error: lastError };
    }

    const delay = computeBackoffDelayMs(attempt, cfg);
    await sleep(delay);
  }

  return { data: null, error: lastError! };
}
