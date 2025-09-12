'use client';

import { RouterOutputs } from '@/trpc/client';
import { FeedItem, LoadingFeedItem } from './item';
import { Info } from 'lucide-react';
import { use } from 'react';
import { addHours } from 'date-fns';

interface Props {
  feedPromise: Promise<RouterOutputs['user']['feed']['list']>;
  numAppsPromise: Promise<number>;
}

const numHours = 4;

export const FeedItems: React.FC<Props> = ({ numAppsPromise, feedPromise }) => {
  const feedItems = use(feedPromise);
  const numApps = use(numAppsPromise);

  const rows = feedItems.items.map(item => ({
    ...item,
    // show the activity at the en of the period, database returns the start of the period
    timestamp: addHours(item.timestamp, numHours),
  }));

  if (rows.length === 0) {
    return (
      <div className="w-full flex gap-2 p-4 items-center">
        <Info className="size-5 text-muted-foreground" />
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">
            {numApps === 0 ? 'No Apps' : 'No Activity'}
          </h4>
          <p className="text-xs text-muted-foreground/60">
            {numApps === 0
              ? 'Your app activity will appear here when you create your first app'
              : 'No activity on your apps yet'}
          </p>
        </div>
      </div>
    );
  }

  return rows.map((item, index) => (
    <FeedItem key={`${item.timestamp.toString()}-${index}`} activity={item} />
  ));
};

export const LoadingFeedItems = () => {
  return Array.from({ length: 5 }).map((_, index) => (
    <LoadingFeedItem key={index} />
  ));
};
