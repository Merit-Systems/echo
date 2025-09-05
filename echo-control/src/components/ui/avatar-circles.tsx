import React from 'react';

import { User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface AvatarCirclesProps {
  className?: string;
  numPeople?: number;
  avatarUrls: (string | undefined)[];
  size?: number;
  avatarClassName?: string;
  fallback?: React.ReactNode;
}

export const AvatarCircles: React.FC<AvatarCirclesProps> = ({
  numPeople = 0,
  className,
  avatarUrls,
  size = 40,
  avatarClassName,
  fallback = <User className="size-full opacity-60" />,
}) => {
  return (
    <div
      className={cn(
        'z-10 flex -space-x-2 rtl:space-x-reverse w-fit',
        className
      )}
    >
      {avatarUrls.map((url, index) => (
        <Avatar
          key={`${url}-${index}`}
          className={cn('rounded-full border-none bg-card', avatarClassName)}
          style={{
            width: size,
            height: size,
            zIndex: index,
          }}
        >
          <AvatarImage src={url} alt={`Avatar ${index + 1}`} />
          <AvatarFallback className="bg-muted dark:bg-muted p-2">
            {fallback}
          </AvatarFallback>
        </Avatar>
      ))}
      {numPeople > 0 && (
        <p
          className="flex items-center justify-center rounded-full bg-card border text-center text-xs font-medium text-black dark:bg-neutral-700 dark:text-white shrink-0"
          style={{
            width: size,
            height: size,
            zIndex: avatarUrls.length,
          }}
        >
          +{numPeople}
        </p>
      )}
    </div>
  );
};

interface AvatarCirclesSkeletonProps {
  numAvatars: number;
  className?: string;
  size?: number;
  numPeople?: number;
}

export const AvatarCirclesSkeleton: React.FC<AvatarCirclesSkeletonProps> = ({
  numAvatars,
  className,
  size = 40,
  numPeople = 0,
}) => {
  return (
    <div
      className={cn(
        'z-10 flex -space-x-2 rtl:space-x-reverse w-fit',
        className
      )}
    >
      {Array.from({ length: numAvatars }).map((_, index) => (
        <Skeleton
          key={index}
          className="rounded-full border-none"
          style={{
            width: size,
            height: size,
            zIndex: index,
          }}
        />
      ))}
      {numPeople > 0 && (
        <p
          className="flex items-center justify-center rounded-full bg-neutral-100 text-center text-xs font-medium text-black dark:bg-neutral-700 dark:text-white shrink-0"
          style={{
            width: size,
            height: size,
            zIndex: numAvatars,
          }}
        >
          +{numPeople}
        </p>
      )}
    </div>
  );
};
