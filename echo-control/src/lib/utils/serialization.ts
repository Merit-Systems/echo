import type { Transaction as PrismaTransaction } from '@/generated/prisma';

/**
 * Serialized version of Transaction with Decimal values converted to numbers
 */
export type SerializedTransaction = Omit<PrismaTransaction, 'totalCost'> & {
  totalCost: number;
};

/**
 * Convert a Prisma Transaction to a serializable format
 * Converts Decimal values to numbers for Client Component compatibility
 */
function serializeTransaction(
  transaction: PrismaTransaction
): SerializedTransaction {
  return {
    ...transaction,
    totalCost: Number(transaction.totalCost),
  };
}

/**
 * Convert multiple transactions to serializable format
 */
export function serializeTransactions(
  transactions: PrismaTransaction[]
): SerializedTransaction[] {
  return transactions.map(serializeTransaction);
}
