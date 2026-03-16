/**
 * Typed error variants for neverthrow Result types.
 * Each error variant carries structured context for downstream handling.
 */

export type DbError =
  | { type: 'DB_NOT_FOUND'; entity: string; id?: string }
  | { type: 'DB_VALIDATION_FAILED'; message: string }
  | { type: 'DB_TRANSACTION_FAILED'; cause: unknown }
  | { type: 'DB_QUERY_FAILED'; cause: unknown };

export type AuthError =
  | { type: 'AUTH_INVALID_API_KEY' }
  | { type: 'AUTH_EXPIRED_JWT' }
  | { type: 'AUTH_JWT_VERIFICATION_FAILED'; cause: unknown }
  | { type: 'AUTH_MISSING_FIELDS'; fields: string[] }
  | { type: 'AUTH_MISSING_CREDENTIALS' };

export type SettleError =
  | { type: 'SETTLE_SMART_ACCOUNT_FAILED'; cause: unknown }
  | { type: 'SETTLE_INVALID_PAYMENT_HEADER'; cause: unknown }
  | { type: 'SETTLE_INVALID_PAYLOAD'; cause: unknown }
  | { type: 'SETTLE_INSUFFICIENT_PAYMENT'; required: bigint; provided: bigint }
  | { type: 'SETTLE_FACILITATOR_FAILED' };

export type RefundError =
  | { type: 'REFUND_TRANSFER_FAILED'; cause: unknown };

export type ResourceError =
  | { type: 'RESOURCE_EXECUTION_FAILED'; cause: unknown }
  | { type: 'RESOURCE_AUTHENTICATION_FAILED'; cause: unknown }
  | { type: 'RESOURCE_PAYMENT_FAILED'; cause: SettleError }
  | { type: 'RESOURCE_TRANSACTION_FAILED'; cause: unknown };
