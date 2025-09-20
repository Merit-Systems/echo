'use client';

import React from 'react';

import { User as UserIcon } from 'lucide-react';

import { api } from '@/trpc/client';
import { UserAvatar } from '@/components/utils/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface UserHeaderProps {
  userId: string;
  className?: string;
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  userId,
  className,
}) => {
  const { data, isLoading, isError } = api.admin.user.getUser.useQuery({
    userId,
  });

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-6 border rounded-lg p-4',
          className
        )}
      >
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-6 border rounded-lg p-4',
          className
        )}
      >
        <div className="flex items-center gap-4">
          <UserAvatar
            src={undefined}
            className="size-16"
            fallback={<UserIcon className="size-6" />}
          />
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">User not found</h2>
            <p className="text-sm text-muted-foreground">
              Unable to load user information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = data.name ?? 'Unnamed User';
  const joinedDate = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString()
    : undefined;
  const email = data.email ?? '';
  const totalPaid = Number(data.totalPaid ?? 0);
  const totalSpent = Number(data.totalSpent ?? 0);
  const balance = totalPaid - totalSpent;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-6 border rounded-lg p-4 mb-4',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <UserAvatar
          src={data.image}
          className="size-16"
          fallback={<UserIcon className="size-6" />}
        />
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold leading-tight">{displayName}</h2>
          {email && <p className="text-sm text-muted-foreground">{email}</p>}
          {joinedDate && (
            <p className="text-xs text-muted-foreground">Joined {joinedDate}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end">
        <span className="text-sm text-muted-foreground">Balance</span>
        <span className="text-2xl font-semibold">
          {formatCurrency(balance)}
        </span>
        <span className="text-xs text-muted-foreground">
          Paid {formatCurrency(totalPaid)} · Spent {formatCurrency(totalSpent)}
        </span>
      </div>
    </div>
  );
};
