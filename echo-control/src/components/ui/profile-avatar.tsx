'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage } from './avatar';

interface ProfileAvatarProps {
  name: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  alt?: string;
  rounded?: 'full' | 'lg' | 'xl' | '2xl';
}

const sizeMap = {
  xs: { container: 'w-6 h-6', text: 'text-xs' },
  sm: { container: 'w-8 h-8', text: 'text-sm' },
  md: { container: 'w-10 h-10', text: 'text-lg' },
  lg: { container: 'w-16 h-16', text: 'text-2xl' },
  xl: { container: 'w-20 h-20', text: 'text-3xl' },
  '2xl': { container: 'w-28 h-28', text: 'text-4xl' },
};

const roundedMap = {
  full: 'rounded-full',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  name,
  src,
  size = 'md',
  className,
  alt,
  rounded = 'full',
}) => {
  const sizeClasses = sizeMap[size];
  const roundedClass = roundedMap[rounded];

  // Get the first character of the name, fallback to '?'
  const initial = (name ?? '').charAt(0).toUpperCase() ?? '?';

  // If we have a valid src and no error, show the image
  if (src) {
    return (
      <Avatar>
        <AvatarImage
          src={src}
          width={112}
          height={112}
          alt={alt ?? `${name} profile`}
          className={cn(
            sizeClasses.container,
            roundedClass,
            'object-cover shrink-0',
            className
          )}
        />
      </Avatar>
    );
  }

  // Otherwise show the fallback gradient with initial
  return (
    <div
      className={cn(
        sizeClasses.container,
        roundedClass,
        'bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0',
        sizeClasses.text,
        className
      )}
    >
      {initial}
    </div>
  );
};
