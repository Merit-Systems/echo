import { Suspense } from 'react';

import { Card } from '@/components/ui/card';

import { ReferralBonusAmount, ReferralBonusAmountSkeleton } from './amount';

import { api, HydrateClient } from '@/trpc/server';

interface BaseProps {
  title: string;
  description: string;
}

interface Props extends BaseProps {
  appId: string;
  children?: React.ReactNode;
}

export const ReferralBonus: React.FC<Props> = ({
  appId,
  title,
  description,
  children,
}) => {
  void api.apps.app.referralReward.get.prefetch(appId);

  return (
    <HydrateClient>
      <ReferralBonusContainer title={title} description={description}>
        <Suspense fallback={<ReferralBonusAmountSkeleton />}>
          <ReferralBonusAmount appId={appId}>{children}</ReferralBonusAmount>
        </Suspense>
      </ReferralBonusContainer>
    </HydrateClient>
  );
};

export const LoadingReferralBonus = ({ title, description }: BaseProps) => {
  return (
    <ReferralBonusContainer title={title} description={description}>
      <ReferralBonusAmountSkeleton />
    </ReferralBonusContainer>
  );
};

const ReferralBonusContainer = ({
  children,
  title,
  description,
}: BaseProps & {
  children: React.ReactNode;
}) => {
  return (
    <Card className="border rounded-lg overflow-hidden flex flex-col gap-2 p-4">
      <h1 className="text-lg font-semibold text-muted-foreground">{title}</h1>
      <div className="w-full">{children}</div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
};
