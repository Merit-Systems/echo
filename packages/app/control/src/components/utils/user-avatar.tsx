import React from 'react';

import { User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

interface Props {
  src: string | null | undefined;
  fallback?: React.ReactNode;
  className?: string;
}

export const UserAvatar: React.FC<Props> = ({ src, fallback, className }) => {
  return (
    <Avatar className={cn('rounded-md overflow-hidden bg-card', className)}>
      {src ? <AvatarImage src={src} className="size-full" /> : <AvatarImage />}
      <AvatarFallback
        className={cn(
          'size-full flex items-center justify-center border rounded-md',
          className
        )}
      >
        {fallback || <User className="size-4" />}
      </AvatarFallback>
    </Avatar>
  );
};
