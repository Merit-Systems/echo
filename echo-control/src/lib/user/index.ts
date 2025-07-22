import { User } from '@/generated/prisma';
import { UserApiResponse } from './types';

export * from './types';

export function formatUserForApiResponse(user: User): UserApiResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    totalPaid: Number(user.totalPaid),
    totalSpent: Number(user.totalSpent),
  };
}
