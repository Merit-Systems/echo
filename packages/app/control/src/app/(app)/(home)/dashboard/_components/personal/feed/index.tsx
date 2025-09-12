import { HydrateClient } from '@/trpc/server';
import { FeedItems, LoadingFeedItems } from './items';
import { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { RouterOutputs } from '@/trpc/client';
import { SubSection } from '../../utils';

interface Props {
  numAppsPromise: Promise<number>;
  feedPromise: Promise<RouterOutputs['user']['feed']['list']>;
}

export const Feed: React.FC<Props> = ({ numAppsPromise, feedPromise }) => {
  return (
    <HydrateClient>
      <FeedContainer>
        <Suspense fallback={<LoadingFeedItems />}>
          <FeedItems
            numAppsPromise={numAppsPromise}
            feedPromise={feedPromise}
          />
        </Suspense>
      </FeedContainer>
    </HydrateClient>
  );
};

export const LoadingFeed = () => {
  return (
    <FeedContainer>
      <LoadingFeedItems />
    </FeedContainer>
  );
};

const FeedContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <SubSection title="Recent Activity" href="/activity">
      <Card className="p-0 overflow-hidden relative">{children}</Card>
    </SubSection>
  );
};
