import { db } from '../db';
import {
  User,
  Payment,
  Transaction,
  CreditGrant,
  Prisma,
} from '@/generated/prisma';
import {
  CreditGrantType,
  CreditGrantSource,
  RevenueType,
  CREDIT_GRANT_TYPES,
  CREDIT_GRANT_SOURCES,
} from '../shared/enums';
import { getCurrentMarkup } from '@/lib/markup';

/**
 * CREDIT GRANT SYSTEM
 *
 * This module manages credit grants which are the building blocks of user balances.
 * Credit grants can be:
 * - 'credit': Adds to user balance (from payments, promotions, refunds, etc.)
 * - 'debit': Subtracts from user balance (from transactions, adjustments, etc.)
 *
 * All amounts support pico-cent precision with DECIMAL(65,14) storage.
 */

export interface CreateCreditGrantRequest {
  type: CreditGrantType;
  amount: number; // Amount in dollars (will be stored with pico-cent precision)
  source: CreditGrantSource;
  description?: string;
  expiresAt?: Date; // Optional expiration date for credits
  paymentId?: string; // Link to payment if created from payment
  transactionId?: string; // Link to transaction if created from transaction debit
}

export interface CreditGrantFilters {
  type?: CreditGrantType;
  source?: CreditGrantSource;
  isActive?: boolean;
  isExpired?: boolean;
  paymentId?: string;
  transactionId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Create a new credit grant for a user
 * @param user - The user to grant credits to
 * @param request - Credit grant details
 * @returns The created credit grant
 */
export async function createCreditGrant(
  user: User,
  request: CreateCreditGrantRequest
): Promise<CreditGrant> {
  const {
    type,
    amount,
    source,
    description,
    expiresAt,
    paymentId,
    transactionId,
  } = request;

  if (!amount || amount <= 0) {
    throw new Error('Valid amount is required');
  }

  if (!CREDIT_GRANT_TYPES.includes(type)) {
    throw new Error('Type must be either "credit" or "debit"');
  }

  if (!CREDIT_GRANT_SOURCES.includes(source)) {
    throw new Error('Invalid source provided');
  }

  // Validate that credit grants from payments have a paymentId
  if (source === 'payment' && !paymentId) {
    throw new Error('PaymentId is required for payment-sourced credit grants');
  }

  // Validate that debit grants from transactions have a transactionId
  if (source === 'transaction' && !transactionId) {
    throw new Error(
      'TransactionId is required for transaction-sourced credit grants'
    );
  }

  // For transaction-sourced debits, we need the transaction details for revenue creation
  const transaction =
    type === CreditGrantType.DEBIT &&
    source === CreditGrantSource.TRANSACTION &&
    transactionId
      ? await db.transaction.findUnique({
          where: { id: transactionId },
          select: { echoAppId: true, model: true, cost: true },
        })
      : null;

  return db.$transaction(async tx => {
    const creditGrant = await tx.creditGrant.create({
      data: {
        type,
        amount,
        source,
        description,
        expiresAt,
        userId: user.id,
        paymentId,
        transactionId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        user: true,
        payment: true,
        transaction: true,
      },
    });

    // Create revenue record for transaction-sourced debit grants
    if (
      type === CreditGrantType.DEBIT &&
      source === CreditGrantSource.TRANSACTION &&
      transaction
    ) {
      // Get the app's current markup rate
      const markupRate = (await getCurrentMarkup(transaction.echoAppId)) || 1.0;

      // Calculate revenue components
      const rawCost = Number(transaction.cost);
      const markupAmount = rawCost * markupRate - rawCost;
      const finalAmount = rawCost * markupRate;

      await tx.revenue.create({
        data: {
          rawCost,
          markupRate,
          markupAmount,
          amount: finalAmount,
          type: RevenueType.CREDIT_DEBIT,
          description:
            description || `Revenue from LLM usage: ${transaction.model}`,
          userId: user.id,
          echoAppId: transaction.echoAppId,
          creditGrantId: creditGrant.id,
          transactionId: transactionId!,
          isActive: true,
        },
      });

      console.log(
        `✅ Created debit grant and revenue record of $${finalAmount} for user ${user.id} from transaction ${transactionId}`
      );
    } else {
      console.log(`✅ Created credit grant of $${amount} for user ${user.id}`);
    }

    return creditGrant;
  });
}

/**
 * Create a credit grant specifically from a completed payment
 * @param payment - The completed payment
 * @param description - Optional description override
 * @returns The created credit grant
 */
export async function createCreditGrantFromPayment(
  payment: Payment,
  description?: string
): Promise<CreditGrant> {
  const user = await db.user.findUnique({
    where: { id: payment.userId },
  });

  if (!user) {
    throw new Error('User not found for payment');
  }

  return createCreditGrant(user, {
    type: CreditGrantType.CREDIT,
    amount: Number(payment.amount),
    source: CreditGrantSource.PAYMENT,
    description: description || payment.description || 'Credit from payment',
    paymentId: payment.id,
  });
}

/**
 * Create a debit grant from a transaction (for spending credits)
 * @param transaction - The transaction that consumed credits
 * @param user - The user who made the transaction
 * @param description - Optional description override
 * @returns The created debit grant
 */
export async function createDebitGrantFromTransaction(
  transaction: Transaction,
  user: User,
  description?: string
): Promise<CreditGrant> {
  return createCreditGrant(user, {
    type: CreditGrantType.DEBIT,
    amount: Number(transaction.cost),
    source: CreditGrantSource.TRANSACTION,
    description: description || `LLM usage: ${transaction.model}`,
    transactionId: transaction.id,
  });
}

export interface CreditGrantWithRelations extends CreditGrant {
  payment: Payment | null;
  transaction: Transaction | null;
}

/**
 * Get credit grants for a user with optional filtering
 * @param userId - The user ID
 * @param filters - Optional filters to apply
 * @returns Array of credit grants with relations
 */
export async function getCreditGrants(
  userId: string,
  filters: CreditGrantFilters = {}
): Promise<CreditGrantWithRelations[]> {
  const {
    type,
    source,
    isActive,
    isExpired,
    paymentId,
    transactionId,
    dateFrom,
    dateTo,
  } = filters;

  const whereClause: Prisma.CreditGrantWhereInput = {
    userId,
    isArchived: false,
  };

  if (type) whereClause.type = type;
  if (source) whereClause.source = source;
  if (isActive !== undefined) whereClause.isActive = isActive;
  if (paymentId) whereClause.paymentId = paymentId;
  if (transactionId) whereClause.transactionId = transactionId;

  // Handle expiration filter
  if (isExpired !== undefined) {
    if (isExpired) {
      // Only show expired credits
      whereClause.expiresAt = {
        lte: new Date(),
      };
    } else {
      // Only show non-expired credits (either no expiration or future expiration)
      whereClause.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }];
    }
  }

  // Handle date range filters
  if (dateFrom || dateTo) {
    whereClause.createdAt = {};
    if (dateFrom) whereClause.createdAt.gte = dateFrom;
    if (dateTo) whereClause.createdAt.lte = dateTo;
  }

  return db.creditGrant.findMany({
    where: whereClause,
    include: {
      payment: true,
      transaction: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Calculate total balance from credit grants for a user
 * @param userId - The user ID
 * @param includeExpired - Whether to include expired credits in the calculation
 * @returns Balance information calculated from credit grants
 */
export async function calculateBalanceFromCreditGrants(
  userId: string,
  includeExpired: boolean = false
): Promise<{
  balance: number;
  totalCredits: number;
  totalDebits: number;
  activeCredits: number;
  expiredCredits: number;
}> {
  const now = new Date();

  // Run all aggregation queries in parallel for efficiency
  const [
    totalCreditsResult,
    activeCreditsResult,
    expiredCreditsResult,
    totalDebitsResult,
  ] = await Promise.all([
    // Get total credits (all credits regardless of expiration)
    db.creditGrant.aggregate({
      where: {
        userId,
        isActive: true,
        isArchived: false,
        type: CreditGrantType.CREDIT,
      },
      _sum: {
        amount: true,
      },
    }),

    // Get active credits (non-expired credits)
    db.creditGrant.aggregate({
      where: {
        userId,
        isActive: true,
        isArchived: false,
        type: CreditGrantType.CREDIT,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      _sum: {
        amount: true,
      },
    }),

    // Get expired credits
    db.creditGrant.aggregate({
      where: {
        userId,
        isActive: true,
        isArchived: false,
        type: CreditGrantType.CREDIT,
        expiresAt: {
          lte: now,
        },
      },
      _sum: {
        amount: true,
      },
    }),

    // Get total debits
    db.creditGrant.aggregate({
      where: {
        userId,
        isActive: true,
        isArchived: false,
        type: CreditGrantType.DEBIT,
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const totalCredits = Number(totalCreditsResult._sum.amount || 0);
  const activeCredits = Number(activeCreditsResult._sum.amount || 0);
  const expiredCredits = Number(expiredCreditsResult._sum.amount || 0);
  const totalDebits = Number(totalDebitsResult._sum.amount || 0);

  // Calculate balance
  const balance = includeExpired
    ? totalCredits - totalDebits
    : activeCredits - totalDebits;

  console.log('balance', balance);
  console.log('totalCredits', totalCredits);
  console.log('totalDebits', totalDebits);
  console.log('activeCredits', activeCredits);
  console.log('expiredCredits', expiredCredits);

  return {
    balance,
    totalCredits,
    totalDebits,
    activeCredits,
    expiredCredits,
  };
}

/**
 * Get credit grant summary by source for a user
 * @param userId - The user ID
 * @returns Summary of credit grants grouped by source
 */
export async function getCreditGrantSummaryBySource(userId: string): Promise<
  Array<{
    source: string;
    creditTotal: number;
    debitTotal: number;
    netTotal: number;
    count: number;
  }>
> {
  const grants = await db.creditGrant.groupBy({
    by: ['source', 'type'],
    where: {
      userId,
      isActive: true,
      isArchived: false,
    },
    _sum: {
      amount: true,
    },
    _count: true,
  });

  const summaryMap = new Map<
    string,
    {
      source: string;
      creditTotal: number;
      debitTotal: number;
      netTotal: number;
      count: number;
    }
  >();

  for (const grant of grants) {
    const source = grant.source;
    const amount = Number(grant._sum.amount || 0);
    const count = grant._count;

    if (!summaryMap.has(source)) {
      summaryMap.set(source, {
        source,
        creditTotal: 0,
        debitTotal: 0,
        netTotal: 0,
        count: 0,
      });
    }

    const summary = summaryMap.get(source)!;
    summary.count += count;

    if (grant.type === CreditGrantType.CREDIT) {
      summary.creditTotal += amount;
    } else if (grant.type === CreditGrantType.DEBIT) {
      summary.debitTotal += amount;
    }

    summary.netTotal = summary.creditTotal - summary.debitTotal;
  }

  return Array.from(summaryMap.values()).sort(
    (a, b) => b.netTotal - a.netTotal
  );
}

/**
 * Archive (soft delete) a credit grant
 * @param creditGrantId - The credit grant ID to archive
 * @returns The updated credit grant
 */
export async function archiveCreditGrant(
  creditGrantId: string
): Promise<CreditGrant> {
  return db.creditGrant.update({
    where: { id: creditGrantId },
    data: {
      isArchived: true,
      archivedAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

/**
 * Deactivate a credit grant (for expired credits or manual deactivation)
 * @param creditGrantId - The credit grant ID to deactivate
 * @returns The updated credit grant
 */
export async function deactivateCreditGrant(
  creditGrantId: string
): Promise<CreditGrant> {
  return db.creditGrant.update({
    where: { id: creditGrantId },
    data: {
      isActive: false,
      updatedAt: new Date(),
    },
  });
}

/**
 * Process expired credit grants by deactivating them
 * @param userId - Optional user ID to process, if not provided processes all users
 * @returns Number of credit grants deactivated
 */
export async function processExpiredCreditGrants(
  userId?: string
): Promise<number> {
  const now = new Date();

  const whereClause: Prisma.CreditGrantWhereInput = {
    isActive: true,
    isArchived: false,
    type: CreditGrantType.CREDIT, // Only credits can expire
    expiresAt: {
      lte: now,
    },
  };

  if (userId) {
    whereClause.userId = userId;
  }

  const result = await db.creditGrant.updateMany({
    where: whereClause,
    data: {
      isActive: false,
      updatedAt: now,
    },
  });

  console.log(`🕐 Processed ${result.count} expired credit grants`);

  return result.count;
}

/**
 * Get balance for a user with global credits and debits
 * Both credits and debits are global, but debits maintain app reference for audit purposes
 * This is essentially the same as calculateBalanceFromCreditGrants but provides the interface
 * for app-specific balance calls that should also be global
 * @param userId - The user ID
 * @param echoAppId - The specific app ID (used for context, but balance calculation is still global)
 * @param includeExpired - Whether to include expired credits in the calculation
 * @returns Balance information calculated from global credit grants
 */
export async function calculateAppSpecificBalanceFromCreditGrants(
  userId: string,
  echoAppId: string,
  includeExpired: boolean = false
): Promise<{
  balance: number;
  totalCredits: number;
  totalDebits: number;
  activeCredits: number;
  expiredCredits: number;
}> {
  // For now, app-specific balance is the same as global balance
  // Debits reference which app spent them via transactionId, but all debits count toward balance
  return calculateBalanceFromCreditGrants(userId, includeExpired);
}
