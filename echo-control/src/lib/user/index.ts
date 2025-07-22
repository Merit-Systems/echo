import { User } from '@/generated/prisma';
import { UserApiResponse } from './types';
import { BalanceResult } from '../balance';

export * from './types';

export function formatUserForApiResponse(
  user: User,
  balance: BalanceResult
): UserApiResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    totalPaid: Number(balance.totalPaid) || 0,
    totalSpent: Number(balance.totalSpent) || 0,
  };
}
