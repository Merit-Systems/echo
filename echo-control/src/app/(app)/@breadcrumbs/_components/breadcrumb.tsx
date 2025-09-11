import React from 'react';

import Link from 'next/link';

import type { LucideIcon } from 'lucide-react';

import { UserAvatar } from '@/components/utils/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { Route } from 'next';
import { cn } from '@/lib/utils';

interface Props<T extends string> {
  href: Route<T>;
  image: string | null;
  name: string;
  Fallback: LucideIcon;
  mobileHideText?: boolean;
  disabled?: boolean;
}

export const Breadcrumb = <T extends string>({
  href,
  image,
  name,
  Fallback,
  mobileHideText = false,
  disabled = false,
}: Props<T>) => {
  return (
    <Link
      href={href}
      className={cn(disabled && 'pointer-events-none')}
      aria-disabled={disabled}
    >
      <div className="flex items-center gap-2 cursor-pointer">
        <UserAvatar
          src={image ?? undefined}
          fallback={<Fallback className="size-3" />}
          className="size-5"
        />
        <p
          className={cn(
            'font-semibold text-sm',
            mobileHideText && 'hidden md:block'
          )}
        >
          {name}
        </p>
      </div>
    </Link>
  );
};

export const LoadingBreadcrumb = () => {
  return (
    <div className="flex items-center gap-2 cursor-pointer">
      <Skeleton className="size-5" />
      <Skeleton className="w-16 h-[14px]" />
    </div>
  );
};
