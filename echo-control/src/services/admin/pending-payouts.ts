import { db } from '@/lib/db';
import { PayoutStatus, PayoutType } from '@/services/payouts/referrals';
import {
  type PaginationParams,
  toPaginatedReponse,
} from '@/services/lib/pagination';

export type PendingPayoutListItem = {
  id: string;
  amount: number;
  status: string;
  type: PayoutType;
  createdAt: string;
  updatedAt: string;
  description: string | null;
  // recipient
  recipientAddress: string | null;
  recipientGithubLinkId: string | null;
  recipientGithubUrl: string | null;
  // context
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  echoAppId: string | null;
  echoAppName: string | null;
};

export async function adminListPendingPayouts(pagination: PaginationParams) {
  const { page, page_size } = pagination;
  const skip = page * page_size;

  const [items, totalCount] = await Promise.all([
    db.payout.findMany({
      where: { status: PayoutStatus.PENDING },
      orderBy: { createdAt: 'desc' },
      skip,
      take: page_size,
      include: {
        user: { select: { id: true, email: true, name: true } },
        echoApp: { select: { id: true, name: true } },
        recipientGithubLink: { select: { id: true, githubUrl: true } },
      },
    }),
    db.payout.count({ where: { status: PayoutStatus.PENDING } }),
  ]);

  const mapped: PendingPayoutListItem[] = items.map(p => ({
    id: p.id,
    amount: Number(p.amount),
    status: p.status,
    type: p.type as PayoutType,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    description: p.description ?? null,
    recipientAddress: p.recipientAddress ?? null,
    recipientGithubLinkId: p.recipientGithubLinkId ?? null,
    recipientGithubUrl: p.recipientGithubLink?.githubUrl ?? null,
    userId: p.user?.id ?? null,
    userEmail: p.user?.email ?? null,
    userName: p.user?.name ?? null,
    echoAppId: p.echoApp?.id ?? null,
    echoAppName: p.echoApp?.name ?? null,
  }));

  return toPaginatedReponse({
    items: mapped,
    page,
    page_size,
    total_count: totalCount,
  });
}
