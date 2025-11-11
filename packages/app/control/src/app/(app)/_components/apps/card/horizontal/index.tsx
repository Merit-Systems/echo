import Link from 'next/link';

import { Code } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { UserAvatar } from '@/components/utils/user-avatar';

import { LoadingTotalCost, TotalCost } from './cost';
import { Earnings, LoadingEarningsAmount } from './earnings';
import { LoadingTotalTokens, TotalTokens } from './tokens';
import { LoadingTransactions, Transactions } from './transactions';
import { LoadingUsers, Users } from './users';

import { cn } from '@/lib/utils';

interface Props {
  id: string;
  name: string;
  description: string | null;
  profilePictureUrl: string | null;
  homepageUrl: string | null;
}

export const AppCard = ({
  id,
  name,
  description,
  profilePictureUrl,
  homepageUrl,
}: Props) => {
  return (
    <Link href={`/app/${id}`}>
      <Card className="hover:border-primary/50 transition-colors p-4 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4">
        <div className="flex flex-col gap-2 col-span-2 sm:col-span-3">
          <div className="flex flex-row items-center gap-2 flex-1 overflow-hidden">
            <UserAvatar
              className="size-10 shrink-0"
              src={profilePictureUrl ?? undefined}
              fallback={<Code className="size-4" />}
            />
            <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
              <h2 className="text-ellipsis whitespace-nowrap overflow-hidden font-bold text-xl leading-tight">
                {name}
              </h2>
              <p
                className={cn(
                  'text-xs text-muted-foreground/60 hidden sm:block',
                  homepageUrl ? 'text-foreground/80' : 'text-foreground/40'
                )}
              >
                {homepageUrl ?? 'No homepage URL'}
              </p>
            </div>
          </div>
          <p
            className={cn(
              'text-sm text-muted-foreground/60 hidden sm:block',
              !description && 'text-muted-foreground/40'
            )}
          >
            {description ?? 'No description'}
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 justify-center col-span-1">
          <Users appId={id} />
        </div>
        <div className="hidden sm:flex shrink-0 items-center justify-center col-span-1">
          <Transactions appId={id} />
        </div>
        <div className="hidden lg:flex shrink-0 items-center justify-center col-span-1">
          <TotalTokens appId={id} />
        </div>
        <div className="shrink-0 flex items-center justify-center col-span-1">
          <TotalCost appId={id} />
        </div>
        <div className="shrink-0 flex items-center justify-end col-span-1">
          <Earnings appId={id} />
        </div>
      </Card>
    </Link>
  );
};

export const LoadingAppCard = () => {
  return (
    <Card className="p-4 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-4">
      <div className="flex flex-col gap-2 col-span-2 sm:col-span-3">
        <div className="flex items-center gap-2">
          <UserAvatar
            className="size-10 shrink-0"
            src={null}
            fallback={<Code className="size-4" />}
          />
          <div className="flex flex-col">
            <Skeleton className="w-24 h-5 my-[2.5px]" />
            <Skeleton className="w-24 h-3 my-0.5 hidden sm:block" />
          </div>
        </div>
        <Skeleton className="w-3/4 h-4 my-[2px] hidden sm:block" />
      </div>
      <div className="hidden lg:flex items-center gap-2 justify-center col-span-1">
        <LoadingUsers />
      </div>
      <div className="hidden sm:flex shrink-0 items-center justify-center col-span-1">
        <LoadingTransactions />
      </div>
      <div className="hidden lg:flex shrink-0 items-center justify-center col-span-1">
        <LoadingTotalTokens />
      </div>
      <div className="shrink-0 flex items-center justify-center col-span-1">
        <LoadingTotalCost />
      </div>
      <div className="shrink-0 flex items-center justify-end col-span-1">
        <LoadingEarningsAmount />
      </div>
    </Card>
  );
};
