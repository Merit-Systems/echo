import { Result, ok, err, ResultAsync, fromPromise } from 'neverthrow';
import { BaseError, UnexpectedError } from './types';
import logger from '../logger';

export type AppResult<T, E extends BaseError = BaseError> = Result<T, E>;
export type AppResultAsync<T, E extends BaseError = BaseError> = ResultAsync<T, E>;

export function toAppError(error: unknown, context?: Record<string, any>): BaseError {
  if (isBaseError(error)) {
    return error;
  }
  
  if (error instanceof Error) {
    logger.error('Unexpected error caught', {
      error: error.message,
      stack: error.stack,
      context
    });
    
    return new UnexpectedError(error, context);
  }
  
  logger.error('Non-error thrown', { error, context });
  return new UnexpectedError(error, context);
}

export function isBaseError(error: unknown): error is BaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    'statusCode' in error
  );
}

export function safeAsync<T, E extends BaseError = BaseError>(
  fn: () => Promise<T>,
  errorTransform?: (error: unknown) => E
): AppResultAsync<T, E> {
  return ResultAsync.fromPromise(
    fn(),
    (error) => (errorTransform ? errorTransform(error) : toAppError(error)) as E
  );
}

export function safe<T, E extends BaseError = BaseError>(
  fn: () => T,
  errorTransform?: (error: unknown) => E
): AppResult<T, E> {
  try {
    return ok(fn());
  } catch (error) {
    return err((errorTransform ? errorTransform(error) : toAppError(error)) as E);
  }
}

export function logError<E extends BaseError>(error: E): E {
  logger.error(`${error.type}: ${error.message}`, {
    type: error.type,
    statusCode: error.statusCode,
    context: error.context
  });
  return error;
}

export function mapErrorWithLog<T, E1 extends BaseError, E2 extends BaseError>(
  result: AppResult<T, E1>,
  mapFn: (error: E1) => E2
): AppResult<T, E2> {
  return result.mapErr((error) => {
    logError(error);
    return mapFn(error);
  });
}

export function combineResults<T, E extends BaseError>(
  results: AppResult<T, E>[]
): AppResult<T[], E> {
  const values: T[] = [];
  
  for (const result of results) {
    if (result.isErr()) {
      return err(result.error);
    }
    values.push(result.value);
  }
  
  return ok(values);
}

export function combineAsyncResults<T, E extends BaseError>(
  results: AppResultAsync<T, E>[]
): AppResultAsync<T[], E> {
  return ResultAsync.combine(results) as AppResultAsync<T[], E>;
}

export function withTimeout<T, E extends BaseError = BaseError>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError: E
): AppResultAsync<T, E | BaseError> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(timeoutError), timeoutMs)
  );
  
  return ResultAsync.fromPromise(
    Promise.race([promise, timeoutPromise]),
    (error) => (isBaseError(error) ? error : toAppError(error)) as E | BaseError
  );
}

export async function retryWithBackoff<T, E extends BaseError>(
  operation: () => AppResultAsync<T, E>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000,
  shouldRetry?: (error: E) => boolean
): Promise<AppResult<T, E>> {
  let lastError: E;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await operation();
    
    if (result.isOk()) {
      return result;
    }
    
    lastError = result.error;
    
    if (shouldRetry && !shouldRetry(lastError)) {
      return result;
    }
    
    if (attempt < maxRetries) {
      const delay = initialDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  
  return err(lastError!);
}

export function validate<T, E extends BaseError>(
  data: unknown,
  validator: (data: unknown) => data is T,
  errorFactory: () => E
): AppResult<T, E> {
  if (validator(data)) {
    return ok(data);
  }
  return err(errorFactory());
}

export function fromNullable<T, E extends BaseError>(
  value: T | null | undefined,
  errorFactory: () => E
): AppResult<T, E> {
  if (value === null || value === undefined) {
    return err(errorFactory());
  }
  return ok(value);
}
