import { db } from '@/lib/db';

import { type PaginationParams, toPaginatedReponse } from './lib/pagination';
import { Prisma } from '@/generated/prisma';

export async function listCreditPayments(
  userId: string,
  pagination: PaginationParams
) {
  return listPayments(
    {
      userId,
      isArchived: false,
      spendPoolId: null,
      description: {
        not: {
          contains: 'Free Tier Credits',
        },
      },
    },
    pagination
  );
}

export async function listFreeTierPayments(
  userId: string,
  appId: string,
  pagination: PaginationParams
) {
  return listPayments(
    {
      userId,
      isArchived: false,
      spendPool: {
        echoAppId: appId,
      },
    },
    pagination
  );
}

async function listPayments(
  where: Prisma.PaymentWhereInput,
  { page, page_size }: PaginationParams
) {
  const skip = page * page_size;

  const [payments, totalCount] = await Promise.all([
    db.payment.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: page_size,
    }),
    db.payment.count({
      where,
    }),
  ]);

  return toPaginatedReponse({
    items: payments.map(payment => ({
      ...payment,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
      archivedAt: payment.archivedAt?.toISOString(),
      amount: Number(payment.amount),
    })),
    page,
    page_size,
    total_count: totalCount,
  });
}
