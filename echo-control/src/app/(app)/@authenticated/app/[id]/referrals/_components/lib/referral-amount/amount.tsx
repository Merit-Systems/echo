'use client';

import { Skeleton } from '@/components/ui/skeleton';

import { api } from '@/trpc/client';

import { cn } from '@/lib/utils';

interface Props {
  appId: string;
  children?: React.ReactNode;
}

export const ReferralBonusAmount: React.FC<Props> = ({ appId, children }) => {
  const [referralReward] =
    api.apps.app.referralReward.get.useSuspenseQuery(appId);

  return (
    <div className="flex items-center gap-4 ">
      <h2
        className={cn(
          'flex items-center gap-4 text-3xl font-bold',
          referralReward ? 'text-foreground' : 'text-foreground/60'
        )}
      >
        {referralReward
          ? (referralReward.amount - 1).toLocaleString(undefined, {
              style: 'percent',
              maximumFractionDigits: 2,
            })
          : 'No Referral Bonus'}
      </h2>
      {children}
    </div>
  );
};

export const ReferralBonusAmountSkeleton = () => {
  return <Skeleton className="w-24 h-9" />;
};
