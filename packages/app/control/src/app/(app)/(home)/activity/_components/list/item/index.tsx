import React from 'react';

import { Code } from 'lucide-react';

import { formatDistanceToNow } from 'date-fns';

import {
  AvatarCircles,
  AvatarCirclesSkeleton,
} from '@/components/ui/avatar-circles';
import { Skeleton } from '@/components/ui/skeleton';

import { UserAvatar } from '@/components/utils/user-avatar';

import { ItemContent } from './content';

import { FeedActivity } from '@/services/feed/types';

interface Props {
  activity: FeedActivity;
}

export const FeedItem: React.FC<Props> = ({ activity }) => {
  return (
    <FeedItemContainer>
      <div className="text-sm w-full min-w-0 col-span-5 flex items-center font-medium">
        <ItemContent activity={activity} />
      </div>
      <div className="col-span-3 flex items-center gap-2">
        <UserAvatar
          src={activity.app.profilePictureUrl}
          fallback={<Code className="size-3" />}
          className="size-4"
        />
        <span className="text-xs">{activity.app.name}</span>
      </div>

      <div className="col-span-2 flex items-center gap-2">
        <AvatarCircles
          avatarUrls={activity.users
            .slice(0, 6)
            .map(user => user.userProfilePicture ?? undefined)}
          numPeople={Math.max(activity.users.length - 6, 0)}
          size={24}
        />
      </div>

      <div className="flex items-center gap-2 flex-1 overflow-hidden col-span-2 text-xs text-muted-foreground/60 justify-end">
        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
      </div>
    </FeedItemContainer>
  );
};

interface LoadingFeedItemProps {
  index: number;
}

export const LoadingFeedItem: React.FC<LoadingFeedItemProps> = ({ index }) => {
  return (
    <FeedItemContainer>
      <div className="text-sm w-full min-w-0 col-span-5 flex items-center gap-1">
        <Skeleton className="size-4" />
        <Skeleton className="w-3/4 h-4 my-0.5" />
      </div>
      <div className="col-span-3 flex items-center gap-2">
        <UserAvatar
          src={undefined}
          fallback={<Code className="size-3" />}
          className="size-4"
        />
        <Skeleton className="w-20 my-0.5 h-3" />
      </div>

      <div className="col-span-2 flex items-center gap-2">
        <AvatarCirclesSkeleton numAvatars={(index + 1) % 3} size={24} />
      </div>

      <div className="flex items-center gap-2 flex-1 overflow-hidden col-span-2 text-xs text-muted-foreground/60 justify-end">
        <Skeleton className="w-16 h-3 my-0.5" />
      </div>
    </FeedItemContainer>
  );
};

const FeedItemContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border-b last:border-b-0 p-2 grid grid-cols-12 gap-2">
      {children}
    </div>
  );
};
