import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export interface GlobalPaymentsAndSpending {
  // Credits issued breakdown
  creditsIssuedByAdmin: number;
  creditsIssuedBySignupGift: number;
  creditsIssuedByStripe: number;
  stripeFeesCollected: number; // 2.9% of stripe credits

  // Global spending breakdown
  totalSpentAcrossAllApps: number;
  totalSpentOnFreeTier: number;
  totalSpentOnUserBalances: number;

  // Global earnings breakdown
  totalReferralProfitEarned: number;
  totalReferralProfitClaimed: number;
  totalMarkupProfitEarned: number;
  totalMarkupProfitClaimed: number;
  totalSpentOnTransactionCosts: number;

  // Payment details
  payments: PaymentDetail[];
}

export interface PaymentDetail {
  id: string;
  source: string;
  amount: number;
  userId: string;
  userName: string | null;
  userEmail: string;
  freeTierDelta: number;
  userBalanceDelta: number;
  createdAt: Date;
}

export interface PaymentsGlobalPaginated {
  summary: GlobalPaymentsAndSpending;
  payments: PaymentDetail[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export async function getGlobalPaymentsAndSpending(): Promise<GlobalPaymentsAndSpending> {
  // Get credits issued breakdown using Prisma aggregation
  const adminCreditsAgg = await db.payment.aggregate({
    where: { source: 'admin', isArchived: false },
    _sum: { amount: true },
  });

  const signupCreditsAgg = await db.payment.aggregate({
    where: { source: 'signUpGift', isArchived: false },
    _sum: { amount: true },
  });

  const stripeCreditsAgg = await db.payment.aggregate({
    where: { source: 'stripe', isArchived: false },
    _sum: { amount: true },
  });

  const creditsIssuedByAdmin = Number(adminCreditsAgg._sum.amount || 0);
  const creditsIssuedBySignupGift = Number(signupCreditsAgg._sum.amount || 0);
  const creditsIssuedByStripe = Number(stripeCreditsAgg._sum.amount || 0);
  const stripeFeesCollected = creditsIssuedByStripe * 0.029; // 2.9%

  // Get global spending breakdown using Prisma aggregation
  const totalSpentAgg = await db.transaction.aggregate({
    where: { isArchived: false },
    _sum: { totalCost: true },
  });

  const freeTierSpentAgg = await db.transaction.aggregate({
    where: { 
      isArchived: false,
      spendPoolId: { not: null },
    },
    _sum: { totalCost: true },
  });

  const userBalanceSpentAgg = await db.transaction.aggregate({
    where: { 
      isArchived: false,
      spendPoolId: null,
    },
    _sum: { totalCost: true },
  });

  const totalSpentAcrossAllApps = Number(totalSpentAgg._sum.totalCost || 0);
  const totalSpentOnFreeTier = Number(freeTierSpentAgg._sum.totalCost || 0);
  const totalSpentOnUserBalances = Number(userBalanceSpentAgg._sum.totalCost || 0);

  // Get global earnings breakdown using Prisma aggregation
  const earningsAgg = await db.transaction.aggregate({
    where: { isArchived: false },
    _sum: { 
      referralProfit: true,
      markUpProfit: true,
      rawTransactionCost: true,
    },
  });

  const totalReferralProfitEarned = Number(earningsAgg._sum.referralProfit || 0);
  const totalMarkupProfitEarned = Number(earningsAgg._sum.markUpProfit || 0);
  const totalSpentOnTransactionCosts = Number(earningsAgg._sum.rawTransactionCost || 0);

  // Get claimed profits from payouts using Prisma aggregation
  const referralPayoutsAgg = await db.payout.aggregate({
    where: { 
      status: 'completed',
      type: 'referral',
    },
    _sum: { amount: true },
  });

  const markupPayoutsAgg = await db.payout.aggregate({
    where: { 
      status: 'completed',
      type: 'markup',
    },
    _sum: { amount: true },
  });

  const totalReferralProfitClaimed = Number(referralPayoutsAgg._sum.amount || 0);
  const totalMarkupProfitClaimed = Number(markupPayoutsAgg._sum.amount || 0);

  // Get recent payments
  const payments = await getPaymentsPaginated(0, 50);

  return {
    creditsIssuedByAdmin,
    creditsIssuedBySignupGift,
    creditsIssuedByStripe,
    stripeFeesCollected,
    totalSpentAcrossAllApps,
    totalSpentOnFreeTier,
    totalSpentOnUserBalances,
    totalReferralProfitEarned,
    totalReferralProfitClaimed,
    totalMarkupProfitEarned,
    totalMarkupProfitClaimed,
    totalSpentOnTransactionCosts,
    payments: payments.payments,
  };
}

export async function getPaymentsPaginated(
  page: number = 0,
  pageSize: number = 25,
  searchTerm?: string,
  sortField?: string,
  sortDirection?: 'asc' | 'desc'
): Promise<{
  payments: PaymentDetail[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}> {
  // Build where clause for search
  const searchWhere = searchTerm
    ? (() => {
        const orFilters: Prisma.PaymentWhereInput[] = [
          { user: { name: { contains: searchTerm, mode: 'insensitive' as const } } },
          { user: { email: { contains: searchTerm, mode: 'insensitive' as const } } },
        ];

        // Try exact match for ID if the search term looks like an ID (UUID/CUID format)
        if (searchTerm.match(/^[a-zA-Z0-9_-]+$/)) {
          orFilters.push({ id: { equals: searchTerm } });
        }

        const st = searchTerm.toLowerCase();
        const matchedSources: string[] = [];
        if ('stripe'.includes(st) || st.includes('stripe')) matchedSources.push('stripe');
        if ('admin'.includes(st) || st.includes('admin')) matchedSources.push('admin');
        if (st.includes('signup') || st.includes('sign up') || st.includes('gift'))
          matchedSources.push('signUpGift');

        if (matchedSources.length > 0) {
          orFilters.push({ source: { in: matchedSources as Prisma.EnumPaymentSource[] } });
        }

        return { OR: orFilters };
      })()
    : {};

  // Build order by clause
  let orderBy: Prisma.PaymentOrderByWithRelationInput = { createdAt: 'desc' };
  if (sortField && sortDirection) {
    switch (sortField) {
      case 'amount':
        orderBy = { amount: sortDirection };
        break;
      case 'source':
        orderBy = { source: sortDirection };
        break;
      case 'userName':
        orderBy = { user: { name: sortDirection } };
        break;
      case 'userEmail':
        orderBy = { user: { email: sortDirection } };
        break;
      case 'createdAt':
        orderBy = { createdAt: sortDirection };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }
  }

  const whereClause = {
    isArchived: false,
    ...searchWhere,
  };

  // Get total count
  const total = await db.payment.count({
    where: whereClause,
  });

  // Get paginated payments with user data
  const paymentsData = await db.payment.findMany({
    where: whereClause,
    select: {
      id: true,
      source: true,
      amount: true,
      userId: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy,
    skip: page * pageSize,
    take: pageSize,
  });

  // Calculate deltas for each payment
  const payments: PaymentDetail[] = paymentsData.map(payment => {
    // For simplicity, we'll calculate approximate deltas
    // In a real implementation, you might want to store these values or calculate them more precisely
    let freeTierDelta = 0;
    let userBalanceDelta = 0;

    if (payment.source === 'admin' || payment.source === 'signUpGift') {
      // Admin and signup gifts typically go to free tier pools
      freeTierDelta = Number(payment.amount);
    } else if (payment.source === 'stripe') {
      // Stripe payments go to user balance
      userBalanceDelta = Number(payment.amount);
    }

    return {
      id: payment.id,
      source: payment.source,
      amount: Number(payment.amount),
      userId: payment.userId,
      userName: payment.user.name,
      userEmail: payment.user.email,
      freeTierDelta,
      userBalanceDelta,
      createdAt: payment.createdAt,
    };
  });

  return {
    payments,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasMore: (page + 1) * pageSize < total,
    },
  };
}

export async function getGlobalPaymentsAndSpendingPaginated(
  page: number = 0,
  pageSize: number = 25,
  searchTerm?: string,
  sortField?: string,
  sortDirection?: 'asc' | 'desc'
): Promise<PaymentsGlobalPaginated> {
  const summary = await getGlobalPaymentsAndSpending();
  const paginatedPayments = await getPaymentsPaginated(page, pageSize, searchTerm, sortField, sortDirection);

  return {
    summary: {
      ...summary,
      payments: [], // We'll get payments separately
    },
    payments: paginatedPayments.payments,
    pagination: paginatedPayments.pagination,
  };
}