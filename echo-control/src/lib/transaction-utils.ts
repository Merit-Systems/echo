import { PrismaClient } from '@/generated/prisma';
import { db } from './db';

/**
 * Type representing either the global Prisma client or a transaction context
 */
export type DbContext =
  | PrismaClient
  | Parameters<Parameters<typeof db.$transaction>[0]>[0];

/**
 * Helper function to get the appropriate database context (transaction or global db)
 * This ensures that functions can work both within and outside of transactions
 *
 * @param tx Optional transaction context passed from parent function
 * @returns The transaction context if provided, otherwise the global db instance
 */
export function getDbContext(tx?: DbContext): DbContext {
  return tx || db;
}

/**
 * Execute a function within a transaction, ensuring all nested calls use the same transaction
 *
 * @param fn Function to execute within the transaction
 * @returns Promise resolving to the function's return value
 */
export function withTransaction<T>(
  fn: (tx: DbContext) => Promise<T>
): Promise<T> {
  return db.$transaction(fn);
}

/**
 * Type guard to check if a context is a transaction
 */
export function isTransactionContext(
  ctx: DbContext
): ctx is Parameters<Parameters<typeof db.$transaction>[0]>[0] {
  // Check if it has the transaction-specific methods/properties
  // This is a simple check - in practice, both have similar interfaces
  return ctx !== db;
}
