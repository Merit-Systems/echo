'use client';

import React, { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { cn } from '@/lib/utils';
import { SiGithub } from '@icons-pack/react-simple-icons';

export const MinimalGithubAvatar = memo(function MinimalGithubAvatar({
  login,
  className,
  style,
}: {
  login: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <Avatar
      className={cn('size-10 rounded-full overflow-hidden', className)}
      style={style}
    >
      <AvatarImage
        src={`https://github.com/${login}.png`}
        alt={login}
        className="object-cover"
      />
      <AvatarFallback className="bg-muted dark:bg-muted p-2 rounded-none flex items-center justify-center">
        <SiGithub className="size-full opacity-60" />
      </AvatarFallback>
    </Avatar>
  );
});
