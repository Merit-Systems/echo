import {
  AvatarCircles,
  AvatarCirclesSkeleton,
} from '@/components/ui/avatar-circles';
import { UserAvatar } from '@/components/utils/user-avatar';
import { FeedActivity } from '@/services/feed/types';
import { formatDistanceToNow } from 'date-fns';
import { Code } from 'lucide-react';
import { ItemContent } from './content';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  activity: FeedActivity;
}

export const FeedItem: React.FC<Props> = ({ activity }) => {
  return (
    <div className="border-b last:border-b-0 p-2 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <UserAvatar
          src={activity.app.profilePictureUrl}
          fallback={<Code className="size-4" />}
          className="size-6"
        />
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {activity.app.name}
          </p>
          <div className="text-sm">
            <ItemContent activity={activity} />
          </div>
          <p className="text-[10px] text-muted-foreground/60">
            {formatDistanceToNow(activity.timestamp, {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
      <AvatarCircles
        avatarUrls={activity.users
          .slice(0, 4)
          .map(user => user.userProfilePicture ?? undefined)}
        numPeople={Math.min(activity.users.length - 4, 0)}
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
          <Skeleton className="w-16 h-3 my-0.5" />
          <Skeleton className="w-48 h-[14px] my-[3px]" />
          <Skeleton className="w-20 h-[10px] my-[2.5px]" />
        </div>
      </div>
      <AvatarCirclesSkeleton numAvatars={2} size={24} />
    </div>
  );
};
