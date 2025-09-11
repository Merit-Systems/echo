import { db } from '@/lib/db';
import type { PayoutType } from '@/services/payouts/referrals';
import { PayoutStatus } from '@/services/payouts/referrals';
import {
  type PaginationParams,
  toPaginatedReponse,
} from '@/services/lib/pagination';

type CompletedPayoutListItem = {
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
  // transaction details
  transactionId: string | null; // tx hash from Merit
  senderAddress: string | null;
};

export async function adminListCompletedPayouts(pagination: PaginationParams) {
  const { page, page_size } = pagination;
  const skip = page * page_size;

  const [items, totalCount] = await Promise.all([
    db.payout.findMany({
      where: { status: PayoutStatus.COMPLETED },
      orderBy: { createdAt: 'desc' },
      skip,
      take: page_size,
      include: {
        user: { select: { id: true, email: true, name: true } },
        echoApp: { select: { id: true, name: true } },
        recipientGithubLink: { select: { id: true, githubUrl: true } },
      },
    }),
    db.payout.count({ where: { status: PayoutStatus.COMPLETED } }),
  ]);

  const mapped: CompletedPayoutListItem[] = items.map(p => ({
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
    transactionId: p.transactionId ?? null,
    senderAddress: p.senderAddress ?? null,
  }));

  return toPaginatedReponse({
    items: mapped,
    page,
    page_size,
    total_count: totalCount,
  });
}
