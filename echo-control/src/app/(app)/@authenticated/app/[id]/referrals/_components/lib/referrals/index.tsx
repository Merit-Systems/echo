import { Suspense } from 'react';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { ReferralsTable, LoadingReferralsTable } from './table';

import { api, HydrateClient } from '@/trpc/server';

interface BaseProps {
  title: string;
  description: string;
}

interface Props extends BaseProps {
  appId: string;
  referrerUserId: string;
  hideReferrer?: boolean;
}

export const Referrals: React.FC<Props> = async ({
  appId,
  referrerUserId,
  title,
  description,
  hideReferrer,
}) => {
  api.apps.app.memberships.list.prefetchInfinite({
    appId,
    referrerUserId,
  });

  return (
    <HydrateClient>
      <ReferralsContainer title={title} description={description}>
        <Suspense
          fallback={<LoadingReferralsTable hideReferrer={hideReferrer} />}
        >
          <ReferralsTable
            appId={appId}
            referrerUserId={referrerUserId}
            hideReferrer={hideReferrer}
          />
        </Suspense>
      </ReferralsContainer>
    </HydrateClient>
  );
};

export const LoadingReferrals = ({ title, description }: BaseProps) => {
  return (
    <ReferralsContainer title={title} description={description}>
      <LoadingReferralsTable />
    </ReferralsContainer>
  );
};

const ReferralsContainer = ({
  children,
  title,
  description,
}: BaseProps & { children: React.ReactNode }) => {
  return (
    <Card className="bg-transparent">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children}
    </Card>
  );
};
