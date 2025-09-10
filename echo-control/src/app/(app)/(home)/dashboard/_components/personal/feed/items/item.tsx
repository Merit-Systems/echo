import {
  AvatarCircles,
  AvatarCirclesSkeleton,
} from '@/components/ui/avatar-circles';
import { UserAvatar } from '@/components/utils/user-avatar';
import type { FeedActivity } from '@/services/feed/types';
import { formatDistanceToNow } from 'date-fns';
import { Code } from 'lucide-react';
import { ItemContent } from './content';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  activity: FeedActivity;
}

export const FeedItem: React.FC<Props> = ({ activity }) => {
  return (
    <div className="border-b last:border-b-0 p-2 flex justify-between items-center gap-2">
      <div className="flex items-center gap-2 flex-1 overflow-hidden">
        <UserAvatar
          src={activity.app.profilePictureUrl}
          fallback={<Code className="size-4" />}
          className="size-6"
        />
        <div className="flex-1 overflow-hidden">
          <p className="text-[10px] font-medium text-muted-foreground">
            {activity.app.name}{' '}
            <span className="text-muted-foreground/60">
              &middot;{' '}
              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
            </span>
          </p>
          <div className="text-xs font-medium w-full min-w-0">
            <ItemContent activity={activity} />
          </div>
          <p className="text-[10px] text-muted-foreground/60"></p>
        </div>
      </div>
      <AvatarCircles
        avatarUrls={activity.users
          .slice(0, 3)
          .map(user => user.userProfilePicture ?? undefined)}
        numPeople={Math.max(activity.users.length - 3, 0)}
        size={24}
      />
    </div>
  );
};

export const LoadingFeedItem = () => {
  return (
    <div className="border-b last:border-b-0 p-2 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Skeleton className="size-6" />
        <div>
          <div className="flex items-center gap-1">
            <Skeleton className="w-16 h-[10px] my-[2.5px]" />
            &middot;
            <Skeleton className="w-20 h-[10px] my-[2.5px]" />
          </div>
          <Skeleton className="w-48 h-[14px] my-[3px]" />
        </div>
      </div>
      <AvatarCirclesSkeleton numAvatars={2} size={24} />
    </div>
  );
};
